import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios'; // Import axios
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Paperclip, Bot, Loader2 } from 'lucide-react'; // Added Loader2
import { useStore } from '@/lib/store'; // Import store
// Removed unused ChatMessage type import

const ChatInterface: React.FC = () => {
  // Get state and actions from Zustand store
  const chatMessages = useStore((state) => state.chatMessages);
  const addChatMessage = useStore((state) => state.addChatMessage);
  const selectedChatModel = useStore((state) => state.selectedChatModel);
  const setSelectedChatModel = useStore((state) => state.setSelectedChatModel);
  const emotionHistory = useStore((state) => state.emotionHistory);

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Function to get the latest detected emotion
  const getLatestEmotion = () => {
    if (emotionHistory.length === 0) {
      return 'neutral'; // Default if no history
    }
    return emotionHistory[emotionHistory.length - 1].emotion;
  };

  const handleSendMessage = async () => {
    if (inputMessage.trim() === '' || isLoading) return;

    const userMessageContent = inputMessage;
    setInputMessage(''); // Clear input immediately
    setIsLoading(true);
    setError(null);

    // Add user message to store
    addChatMessage({ sender: 'user', text: userMessageContent });

    // Prepare history for backend (limit history length if needed)
    const historyForBackend = chatMessages.map(msg => ({ role: msg.sender === 'user' ? 'user' : 'assistant', content: msg.text }));
    const currentEmotion = getLatestEmotion();

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';
      const response = await axios.post(`${backendUrl}/chat`, {
        message: userMessageContent,
        history: historyForBackend, // Send previous messages as context
        model: selectedChatModel,
        emotion: currentEmotion // Send current emotion context
      });

      if (response.data && response.data.response) {
        // Add AI response to store
        addChatMessage({ sender: 'ai', text: response.data.response });
      } else if (response.data && response.data.error) {
        setError(`AI Error: ${response.data.error}`);
        // Optionally add an error message to chat
        addChatMessage({ sender: 'ai', text: `Sorry, I encountered an error: ${response.data.error}` });
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err: any) {
      console.error('Error sending message:', err);
      const errorMsg = err.response?.data?.error || err.message || 'Failed to get response from AI assistant.';
      setError(errorMsg);
      // Optionally add an error message to chat
      addChatMessage({ sender: 'ai', text: `Sorry, I couldn't process your request: ${errorMsg}` });
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [chatMessages]);

  return (
    <div className="bg-white p-4 rounded-lg shadow border border-blue-200 h-96 flex flex-col">
      <h3 className="text-lg font-semibold mb-2 text-blue-700">AI Wellness Chat</h3>
      <ScrollArea className="flex-grow border rounded p-2 mb-2 bg-blue-50/30" ref={scrollAreaRef}>
        {chatMessages.length === 0 ? (
          <p className="text-sm text-gray-500">Chat history will appear here.</p>
        ) : (
          chatMessages.map((msg) => (
            <div key={msg.id} className={`mb-2 flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`p-2 rounded-lg max-w-[80%] ${msg.sender === 'user' ? 'bg-blue-100 text-blue-900' : 'bg-gray-100 text-gray-900'}`}>
                <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                <p className="text-xs text-gray-400 text-right mt-1">{new Date(msg.timestamp).toLocaleTimeString()}</p>
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex justify-start mb-2">
            <div className="p-2 rounded-lg bg-gray-100 text-gray-900 inline-flex items-center">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              <span className="text-sm italic">Thinking...</span>
            </div>
          </div>
        )}
        {error && (
           <div className="flex justify-start mb-2">
             <div className="p-2 rounded-lg bg-red-100 text-red-700 max-w-[80%]">
                <p className="text-sm font-medium">Error:</p>
                <p className="text-sm">{error}</p>
             </div>
           </div>
        )}
      </ScrollArea>
      <div className="flex items-center space-x-2 mb-2">
        {/* Placeholder for AI Personality Selector */}
        <Button variant="outline" size="icon" className="border-blue-300 text-blue-600 hover:bg-blue-100" title="Select AI Personality (Coming Soon)" disabled>
          <Bot className="h-4 w-4" />
        </Button>
        <Select value={selectedChatModel} onValueChange={setSelectedChatModel}>
          <SelectTrigger className="w-[180px] bg-white border-blue-300 text-blue-800">
            <SelectValue placeholder="Select Model" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="auto">Auto Select</SelectItem>
            <SelectItem value="llama3-70b-8192">Llama3 70B</SelectItem>
            {/* Add other Groq models here if needed */}
            {/* <SelectItem value="mixtral-8x7b-32768">Mixtral 8x7B</SelectItem> */}
            {/* <SelectItem value="gemma-7b-it">Gemma 7B</SelectItem> */}
          </SelectContent>
        </Select>
        {/* Placeholder for File Upload */}
        <Button variant="outline" size="icon" className="border-blue-300 text-blue-600 hover:bg-blue-100" title="Attach File (Coming Soon)" disabled>
          <Paperclip className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex space-x-2">
        <Input
          type="text"
          placeholder="Ask for wellness advice..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
          className="flex-grow"
          disabled={isLoading}
        />
        <Button onClick={handleSendMessage} className="bg-blue-600 hover:bg-blue-700 text-white" disabled={isLoading}>
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send'}
        </Button>
      </div>
    </div>
  );
};

export default ChatInterface;

