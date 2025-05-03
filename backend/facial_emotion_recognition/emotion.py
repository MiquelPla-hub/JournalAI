import cv2
from deepface import DeepFace
import time
import json
from collections import Counter
from datetime import datetime

# Load face cascade classifier
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

# Start capturing video
cap = cv2.VideoCapture(0)

last_emotion = None
last_print_time = time.time()
emotion_history = []
emotion_database = []

def save_to_json(emotion_data):
    with open('emotion_database.json', 'w') as f:
        json.dump(emotion_data, f, indent=4)

def get_most_common_emotion(emotions):
    if not emotions:
        return None
    emotion_counts = Counter(emotions)
    return emotion_counts.most_common(1)[0][0]

while True:
    ret, frame = cap.read()
    gray_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    rgb_frame = cv2.cvtColor(gray_frame, cv2.COLOR_GRAY2RGB)

    faces = face_cascade.detectMultiScale(gray_frame, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))

    for (x, y, w, h) in faces:
        face_roi = rgb_frame[y:y + h, x:x + w]

        try:
            result = DeepFace.analyze(face_roi, actions=['emotion'], enforce_detection=False)
            emotion = result[0]['dominant_emotion']
            last_emotion = emotion
            emotion_history.append(emotion)

            # Draw rectangle and label
            cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 0, 255), 2)
            cv2.putText(frame, emotion, (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 0, 255), 2)
        except Exception as e:
            print("Emotion detection error:", e)

    # Process emotions every 10 seconds
    current_time = time.time()
    if current_time - last_print_time >= 10:
        if emotion_history:
            most_common = get_most_common_emotion(emotion_history)
            timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            
            # Create entry for database
            entry = {
                "timestamp": timestamp,
                "emotions": emotion_history,
                "most_common_emotion": most_common,
                "total_detections": len(emotion_history)
            }
            
            emotion_database.append(entry)
            save_to_json(emotion_database)
            
            print(f"\nEmotion Summary (Last 10 seconds):")
            print(f"Total detections: {len(emotion_history)}")
            print(f"Most common emotion: {most_common}")
            print(f"All emotions detected: {emotion_history}")
            
            # Reset history for next interval
            emotion_history = []
        else:
            print("No emotions detected in the last 10 seconds.")
        
        last_print_time = current_time

    cv2.imshow('Real-time Emotion Detection', frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
