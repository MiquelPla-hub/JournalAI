import React, { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import './App.css';

const SOCKET_URL = 'http://localhost:5003'; // Use your backend port

function App() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [emotion, setEmotion] = useState('neutral');
  const [frame, setFrame] = useState<string | null>(null);

  useEffect(() => {
    // Connect to backend via Socket.IO
    const socket = io(SOCKET_URL);

    // Listen for emotion updates
    socket.on('emotion_update', (data) => {
      setEmotion(data.emotion);
    });

    // Listen for video frames (optional: display processed frame from backend)
    socket.on('video_frame', (data) => {
      setFrame(`data:image/jpeg;base64,${data.image}`);
    });

    // Cleanup on unmount
    return () => {
      socket.disconnect();
    };
  }, []);

  // Show webcam feed in browser (not sent to backend in this example)
  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-56 bg-slate-900 text-white p-8 flex flex-col">
        <h2 className="mb-8 text-2xl font-bold tracking-tight">JournalAI</h2>
        <nav className="flex-1">
          <ul className="space-y-4">
            <li><a href="#" className="hover:text-slate-300">Dashboard</a></li>
            <li><a href="#" className="hover:text-slate-300">Entries</a></li>
            <li><a href="#" className="hover:text-slate-300">Analytics</a></li>
            <li><a href="#" className="hover:text-slate-300">Settings</a></li>
          </ul>
        </nav>
        <div className="mt-8 text-xs text-slate-400">&copy; {new Date().getFullYear()} JournalAI</div>
      </aside>
      {/* Main Content */}
      <main className="flex-1 p-8 bg-gray-50">
        <header className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-1">Welcome to your Mental Health Dashboard</h1>
            <p className="text-slate-500">Track your mood, journal entries, and view analytics here.</p>
          </div>
          <div className="flex items-center gap-2 bg-white rounded-lg shadow px-4 py-2">
            <span className="text-slate-500 font-medium">Current Emotion:</span>
            <span className="text-lg font-semibold capitalize text-indigo-600">{emotion}</span>
          </div>
        </header>
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Camera & Emotion Card */}
          <div className="col-span-1 bg-white rounded-xl shadow p-6 flex flex-col items-center">
            <h2 className="text-lg font-semibold mb-4">Live Camera</h2>
            <video ref={videoRef} autoPlay width={320} height={240} className="rounded-lg border border-slate-200 shadow mb-4" />
            <div className="w-full text-center">
              <span className="text-slate-500">Your live camera feed</span>
            </div>
          </div>
          {/* Processed Frame Card */}
          <div className="col-span-1 bg-white rounded-xl shadow p-6 flex flex-col items-center">
            <h2 className="text-lg font-semibold mb-4">Processed Frame</h2>
            {frame ? (
              <img src={frame} alt="Processed" width={320} height={240} className="rounded-lg border border-slate-200 shadow mb-4" />
            ) : (
              <div className="w-[320px] h-[240px] flex items-center justify-center bg-slate-100 rounded-lg border border-slate-200 mb-4">
                <span className="text-slate-400">Waiting for backend...</span>
              </div>
            )}
            <div className="w-full text-center">
              <span className="text-slate-500">Backend-processed video with emotion overlay</span>
            </div>
          </div>
          {/* Analytics Card */}
          <div className="col-span-1 bg-white rounded-xl shadow p-6 flex flex-col">
            <h2 className="text-lg font-semibold mb-4">Mood Analytics</h2>
            <div className="flex-1 flex items-center justify-center">
              <span className="text-slate-400">Mood analytics coming soon.</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
