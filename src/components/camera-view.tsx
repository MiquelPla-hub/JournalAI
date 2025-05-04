import React, { useState, useEffect, useRef } from 'react';
import io, { Socket } from 'socket.io-client';
import { addAutoJournalEntry } from '@/lib/store'; // Removed unused useStore import

const CameraView: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState('neutral');
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Connect to the Socket.IO server (adjust URL if needed)
    // Assuming backend runs on http://localhost:5001
    const serverUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';
    console.log(`Connecting to WebSocket server at ${serverUrl}`);
    socketRef.current = io(serverUrl);

    socketRef.current.on('connect', () => {
      console.log('Connected to WebSocket server', socketRef.current?.id);
      setIsConnected(true);
    });

    socketRef.current.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
      setIsConnected(false);
      setVideoSrc(null); // Clear video on disconnect
      setCurrentEmotion('neutral');
    });

    socketRef.current.on('connection_response', (data) => {
      console.log('Connection response:', data);
    });

    socketRef.current.on('video_frame', (data) => {
      // Update the video source with the new frame
      setVideoSrc(`data:image/jpeg;base64,${data.image}`);
    });

    socketRef.current.on('emotion_update', (data) => {
      console.log('Emotion update received:', data);
      setCurrentEmotion(data.emotion);
      // Automatically log the detected emotion to the journal
      addAutoJournalEntry(data.emotion);
    });

    socketRef.current.on('connect_error', (err) => {
        console.error('WebSocket connection error:', err);
        setIsConnected(false);
    });

    // Cleanup on component unmount
    return () => {
      if (socketRef.current) {
        console.log('Disconnecting WebSocket...');
        socketRef.current.disconnect();
      }
    };
  }, []); // Empty dependency array ensures this runs only once on mount

  return (
    <div className="bg-white p-4 rounded-lg shadow border border-blue-200">
      <h3 className="text-lg font-semibold mb-2 text-blue-700">Live Camera Feed</h3>
      <div className="w-full aspect-video bg-gray-200 rounded flex items-center justify-center text-gray-500 overflow-hidden">
        {isConnected && videoSrc ? (
          <img src={videoSrc} alt="Live camera feed" className="w-full h-full object-contain" />
        ) : (
          <p>{isConnected ? 'Waiting for video stream...' : 'Connecting to backend...'}</p>
        )}
      </div>
      <p className="mt-2 text-sm text-gray-600">
        Status: <span className={`font-medium ${isConnected ? 'text-green-600' : 'text-red-600'}`}>{isConnected ? 'Connected' : 'Disconnected'}</span>
        <span className="ml-4">Current detected emotion: <span className="font-medium capitalize">{currentEmotion}</span></span>
      </p>
    </div>
  );
};

export default CameraView;

