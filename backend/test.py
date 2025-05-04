import cv2
cap = cv2.VideoCapture(0, cv2.CAP_AVFOUNDATION)  # macOS native backend
if not cap.isOpened():
    print("Cannot open camera")
else:
    print("Camera opened successfully")
    cap.release()