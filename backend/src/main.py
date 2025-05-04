#!/usr/bin/env python
import sys
import os

# Add project root to Python path - DO NOT CHANGE THIS LINE
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

import cv2
import time
import json
import base64
import numpy as np
from collections import Counter
from datetime import datetime
from threading import Lock, Thread
from flask import Flask, render_template, session, request, copy_current_request_context, jsonify
from flask_socketio import SocketIO, emit, join_room, leave_room, close_room, rooms, disconnect
from dotenv import load_dotenv
from groq import Groq, GroqError

# Import your emotion recognition function
from emotion import predict_emotion

load_dotenv()  # Load environment variables from .env file

# --- Groq Client Setup ---
groq_api_key = os.getenv("GROQ_API_KEY")
if not groq_api_key or groq_api_key == "YOUR_GROQ_API_KEY_HERE":
    print("\n*** WARNING: GROQ_API_KEY not found or is placeholder. Chat functionality will be limited. Please create a .env file with your key. ***\n")
    groq_client = None
else:
    try:
        groq_client = Groq(api_key=groq_api_key)
    except Exception as e:
        print(f"Error initializing Groq client: {e}")
        groq_client = None

# Set async mode: "threading" for local dev, "eventlet" or "gevent" for production
async_mode = "threading"

app = Flask(__name__, static_folder="static", static_url_path="")
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "your_secret_key_here")

# Enable CORS for SocketIO (adjust origins for production)
socketio = SocketIO(app, async_mode=async_mode, cors_allowed_origins="*")

# --- Emotion Detection Logic ---
face_cascade = cv2.CascadeClassifier("haarcascade_frontalface_default.xml")

def detect_emotion(face_image):
    if face_image is None or face_image.size == 0:
        return "neutral"
    try:
        gray = cv2.cvtColor(face_image, cv2.COLOR_BGR2GRAY)
        avg_intensity = np.mean(gray)
        std_intensity = np.std(gray)
        if std_intensity > 45:
            if avg_intensity > 115:
                return "happy"
            else:
                return "sad"
        else:
            return "neutral"
    except cv2.error as e:
        print(f"OpenCV error in detect_emotion: {e}")
        return "neutral"
    except Exception as e:
        print(f"Unexpected error in detect_emotion: {e}")
        return "neutral"

# --- Video Processing Thread ---
thread = None
thread_lock = Lock()
video_capture = None
last_detected_emotion_global = "neutral"

def video_processing_thread():
    global video_capture, last_detected_emotion_global
    print("Starting video processing thread...")
    
    disable_camera = os.getenv("DISABLE_CAMERA", "false").lower() == "true"
    
    if disable_camera:
        print("Camera access disabled, emitting default emotion.")
        while True:
            socketio.sleep(0.01)
            socketio.emit("emotion_update", {"emotion": "neutral", "timestamp": datetime.now().isoformat()})
            frame = np.zeros((480, 640, 3), dtype=np.uint8)  # Black 640x480 image
            _, buffer = cv2.imencode(".jpg", frame)
            frame_b64 = base64.b64encode(buffer).decode("utf-8")
            socketio.emit("video_frame", {"image": frame_b64})
    
    try:
        video_capture = cv2.VideoCapture(0)  # Default backend (AVFoundation on macOS)
        if not video_capture.isOpened():
            print("Error: Could not open video source.")
            return

        last_emotion_emit_time = time.time()

        while True:
            socketio.sleep(0.01)
            ret, frame = video_capture.read()
            if not ret:
                print("Failed to grab frame, retrying...")
                socketio.sleep(1)  # Wait before retrying
                continue

            gray_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            faces = face_cascade.detectMultiScale(gray_frame, scaleFactor=1.1, minNeighbors=5, minSize=(50, 50))

            current_emotion = "neutral"
            if len(faces) > 0:
                faces = sorted(faces, key=lambda f: f[2]*f[3], reverse=True)
                (x, y, w, h) = faces[0]
                face_roi = frame[y:y + h, x:x + w]
                current_emotion = predict_emotion(face_roi)
                last_detected_emotion_global = current_emotion

                cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 0, 255), 2)
                cv2.putText(frame, current_emotion, (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
            else:
                current_emotion = last_detected_emotion_global

            _, buffer = cv2.imencode(".jpg", frame)
            frame_b64 = base64.b64encode(buffer).decode("utf-8")
            socketio.emit("video_frame", {"image": frame_b64})

            current_time = time.time()
            if current_emotion != last_detected_emotion_global or current_time - last_emotion_emit_time >= 5:
                if current_emotion:
                    print(f"Emitting emotion: {current_emotion}")
                    socketio.emit("emotion_update", {"emotion": current_emotion, "timestamp": datetime.now().isoformat()})
                    last_emotion_emit_time = current_time

    except Exception as e:
        print(f"Error in video processing thread: {e}")
    finally:
        print("Stopping video capture.")
        if video_capture:
            video_capture.release()

# --- SocketIO Event Handlers ---
@socketio.event
def connect():
    global thread
    with thread_lock:
        if thread is None:
            thread = socketio.start_background_task(video_processing_thread)
    print(f"Client connected: {request.sid}")
    emit("connection_response", {"data": "Connected", "sid": request.sid})

@socketio.event
def disconnect():
    print(f"Client disconnected: {request.sid}")

# --- Flask Routes ---
@app.route("/")
def index():
    index_path = os.path.join(app.static_folder, "index.html")
    if not os.path.exists(index_path):
        return ("Error: index.html not found in static folder. "
                "Ensure React app is built and files are copied to 'backend/src/static'."), 404
    return app.send_static_file("index.html")

@app.route("/<path:filename>")
def serve_static(filename):
    return app.send_static_file(filename)

# --- Groq Chat Proxy Route ---
@app.route("/chat", methods=["POST"])
def chat_proxy():
    global last_detected_emotion_global
    if not groq_client:
        return jsonify({"error": "Groq client not initialized. Please check API key."}), 503

    data = request.json
    user_message = data.get("message", "")
    chat_history = data.get("history", [])
    model = data.get("model", "llama3-70b-8192")
    current_emotion = data.get("emotion", last_detected_emotion_global)

    if model == "auto":
        model = "llama3-70b-8192"

    print(f"Received chat message: '{user_message}' for model {model} with emotion context '{current_emotion}'")

    system_prompt = (
        f"You are a supportive AI wellness assistant, like Alfred the butler, providing general wellness tips. "
        f"The user is currently feeling {current_emotion}. "
        f"Tailor your advice gently based on this, but focus on general well-being. Keep responses concise and helpful."
    )
    messages = [{"role": "system", "content": system_prompt}]
    messages.extend(chat_history)
    messages.append({"role": "user", "content": user_message})

    try:
        chat_completion = groq_client.chat.completions.create(
            messages=messages,
            model=model,
        )
        ai_response = chat_completion.choices[0].message.content
        print(f"Groq response: {ai_response}")
        return jsonify({"response": ai_response})
    except GroqError as e:
        print(f"Groq API Error: {e}")
        return jsonify({"error": f"Groq API Error: {e.type} - {e.message}"}), 500
    except Exception as e:
        print(f"Error during Groq API call: {e}")
        return jsonify({"error": "An unexpected error occurred while contacting the AI assistant."}), 500

@app.route('/api/entries')
def get_entries():
    return jsonify([
        {"id": 1, "text": "First entry", "date": "2024-05-04"},
        {"id": 2, "text": "Second entry", "date": "2024-05-03"}
    ])

# --- Main Execution ---
if __name__ == "__main__":
    if not os.path.exists(app.static_folder):
        os.makedirs(app.static_folder)
        print(f"Created static directory at: {app.static_folder}")
        index_path = os.path.join(app.static_folder, "index.html")
        if not os.path.exists(index_path):
            with open(index_path, "w") as f:
                f.write("<html><body>Placeholder - Build React app and copy files here.</body></html>")
            print(f"Created placeholder index.html at: {index_path}")

    print("Starting Flask server with SocketIO...")
    socketio.run(app, host="0.0.0.0", port=5003, debug=False, use_reloader=False)