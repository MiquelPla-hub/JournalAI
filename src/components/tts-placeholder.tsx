import React from 'react';
import { Button } from "@/components/ui/button";
import { Volume2 } from 'lucide-react'; // Assuming lucide-react is installed

const TTSPlaceholder: React.FC = () => {
  return (
    <div className="bg-white p-4 rounded-lg shadow border border-blue-200 flex items-center justify-between">
      <h3 className="text-lg font-semibold text-blue-700">Text-to-Speech</h3>
      <Button variant="outline" disabled className="border-blue-300 text-blue-400 cursor-not-allowed">
        <Volume2 className="mr-2 h-4 w-4" /> Enable TTS (Coming Soon)
      </Button>
      {/* Placeholder for future integration with Eleven Labs or Nari AI */}
    </div>
  );
};

export default TTSPlaceholder;

