from flask import Flask, jsonify, request
from flask_cors import CORS
from openai_api import chat_response
import openai
import os
import requests
import tempfile

app = Flask(__name__)
CORS(app, origins=["http://localhost:5173"])

# Set your OpenAI API key
openai.api_key = os.getenv("OPENAI_API_KEY")

@app.route('/chat', methods=['POST'])
def chat_endpoint():
    user_message = request.json.get('message')
    response = chat_response(user_message)
    return jsonify(response)  # if it's a Pydantic model

@app.route('/transcribe', methods=['POST'])
def transcribe_audio():
    if 'file' not in request.files:
        return jsonify({'error': 'No audio file uploaded'}), 400

    audio_file = request.files['file']
    
    try:
        # Print details about the file to debug
        print(f"File received: {audio_file.filename}, MIME type: {audio_file.content_type}")
        
        # Create a temporary file with a proper extension
        temp_dir = tempfile.gettempdir()
        temp_path = os.path.join(temp_dir, "audio_recording.webm")
        
        print(f"Saving to temporary file: {temp_path}")
        audio_file.save(temp_path)
        
        # Open the saved file and pass it to OpenAI
        with open(temp_path, "rb") as audio:
            transcript = openai.audio.transcriptions.create(
                model="whisper-1",
                file=audio
            )

       
        
        # Handle different possible response formats
        if hasattr(transcript, 'text'):
            transcribed_text = transcript.text
        elif isinstance(transcript, dict) and 'text' in transcript:
            transcribed_text = transcript['text']
        else:
            transcribed_text = str(transcript)
            
       
        
        # Clean up temporary file
        try:
            os.remove(temp_path)
        except Exception as e:
            print(f"Warning: Could not remove temporary file: {e}")
        
        response = chat_response(transcribed_text)
        print(response)
        return jsonify(response)  # if it's a Pydantic model
        
    except Exception as e:
        print(f"Transcription error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/session', methods=['POST'])
def create_session():
    # Get parameters from request
    data = request.json
    model = data.get('model', 'gpt-4o-realtime-preview-2024-12-17')
    voice = data.get('voice', 'verse')
    
    # Request an ephemeral token from OpenAI
    response = requests.post(
        "https://api.openai.com/v1/realtime/sessions",
        headers={
            "Authorization": f"Bearer {os.environ.get('OPENAI_API_KEY')}",
            "Content-Type": "application/json",
        },
        json={
            "model": model,
            "voice": voice,
        },
    )
    
    # Return the token to the client
    return jsonify(response.json())
if __name__ == '__main__':
    app.run(port=5000, debug=True)
