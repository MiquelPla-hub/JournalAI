import cv2
import numpy as np
import json
import os

# Load emotion database safely
db_path = os.path.join(os.path.dirname(__file__), 'emotion_database.json')
EMOTION_DB = []
if os.path.exists(db_path):
    try:
        with open(db_path, 'r') as f:
            EMOTION_DB = json.load(f)
    except (json.JSONDecodeError, IOError) as e:
        print(f"Error loading emotion_database.json: {e}")
else:
    print(f"Warning: emotion_database.json not found at {db_path}")

def predict_emotion(face_image):
    """
    Predict emotion from a face image, matching the standalone script's logic.
    Args:
        face_image: BGR image (numpy array) of the face region.
    Returns:
        str: Emotion ("happy", "sad", "neutral").
    """
    if face_image is None or face_image.size == 0:
        return "neutral"
    
    try:
        # Convert to grayscale
        gray = cv2.cvtColor(face_image, cv2.COLOR_BGR2GRAY)
        
        # Calculate mean and standard deviation of pixel intensity
        avg_intensity = np.mean(gray)
        std_intensity = np.std(gray)
        
        # Emotion classification based on standalone script's logic
        if std_intensity > 50:  # High contrast indicates expression
            if avg_intensity > 120:  # Brighter regions indicate smile
                return "happy"
            else:
                return "sad"
        else:
            return "neutral"
            
        # Placeholder for future EMOTION_DB usage (e.g., compare with historical data)
        # Example: Could check if current intensity matches patterns in EMOTION_DB
        # for entry in EMOTION_DB:
        #     if matches_pattern(entry, avg_intensity, std_intensity):
        #         return entry['most_common_emotion']
    
    except cv2.error as e:
        print(f"OpenCV error in predict_emotion: {e}")
        return "neutral"
    except Exception as e:
        print(f"Unexpected error in predict_emotion: {e}")
        return "neutral"