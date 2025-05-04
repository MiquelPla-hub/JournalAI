import React from 'react';
import CameraView from './camera-view';
import Journal from './journal';
import ChatInterface from './chat-interface';
import EmotionTrends from './emotion-trends';
import TTSPlaceholder from './tts-placeholder';
import { Button } from "@/components/ui/button";
import { useStore } from '@/lib/store'; // Assuming store is in lib/store.ts

const Dashboard: React.FC = () => {
  const showTrends = useStore((state) => state.showTrends);
  const toggleTrends = useStore((state) => state.toggleTrends);

  return (
    <div className="w-full max-w-7xl mx-auto p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="md:col-span-2 space-y-4">
        <CameraView />
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-blue-800">Emotion Trends</h2>
          <Button onClick={toggleTrends} variant="outline" className="bg-white text-blue-600 border-blue-300 hover:bg-blue-100">
            {showTrends ? 'Hide Trends' : 'Show Trends'}
          </Button>
        </div>
        {showTrends && <EmotionTrends />}
      </div>
      <div className="md:col-span-1 space-y-4">
        <Journal />
        <ChatInterface />
        <TTSPlaceholder />
      </div>
    </div>
  );
};

export default Dashboard;

