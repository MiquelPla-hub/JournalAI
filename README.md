# JournalAI - Mental Health Dashboard

A full-stack application for mental health tracking and analysis, built with React, TypeScript, and Flask.

## Tech Stack
- Frontend: React + TypeScript + Vite + Tailwind CSS
- Backend: Python + Flask + Flask-SocketIO + OpenCV
- Data: JSON file for emotion analytics

## Getting Started

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd JournalAI
```

### 2. Frontend Setup
```bash
cd <project-root>
npm install
npm run dev
```
- The app will be available at http://localhost:5173

### 3. Backend Setup
```bash
cd backend/src
python -m venv ../venv
source ../venv/bin/activate  # On Windows: ..\venv\Scripts\activate
pip install -r ../requirements.txt
python main.py
```
- The backend will run at http://localhost:5003

### 4. Usage
- Open http://localhost:5173 in your browser.
- The dashboard will show live camera, processed video, and mood analytics.

## File Structure
```
backend/
  src/
    main.py
    emotion_database.json
    haarcascade_frontalface_default.xml
    ...
frontend/
  (React app files)
```

## Notes
- Make sure your webcam is connected and accessible for emotion detection.
- All analytics are stored in `emotion_database.json`.
- For development, both frontend and backend should be running simultaneously.

---

For any issues, please open an issue on the repository.
