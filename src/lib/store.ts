import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Define types based on components
export type EmotionLog = {
  timestamp: string;
  emotion: string; // 'happy', 'sad', 'neutral'
};

export type JournalEntry = {
  id: number;
  timestamp: string;
  type: 'manual' | 'auto';
  content: string; // Manual text or detected emotion string
  notes?: string;
};

export type ChatMessage = {
  id: number;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
};

interface AppState {
  // UI State
  showTrends: boolean;
  toggleTrends: () => void;

  // Emotion Data
  emotionHistory: EmotionLog[];
  addEmotionLog: (emotion: string) => void;

  // Journal Data
  journalEntries: JournalEntry[];
  addJournalEntry: (entry: Omit<JournalEntry, 'id' | 'timestamp'>) => void;
  // TODO: Add functions to edit/delete journal entries and add notes

  // Chat Data
  chatMessages: ChatMessage[];
  addChatMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  clearChatHistory: () => void;

  // Settings
  selectedChatModel: string;
  setSelectedChatModel: (model: string) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({ // Removed unused 'get' parameter
      // Initial state
      showTrends: false,
      emotionHistory: [],
      journalEntries: [],
      chatMessages: [],
      selectedChatModel: 'llama3-70b-8192', // Default model

      // Actions
      toggleTrends: () => set((state) => ({ showTrends: !state.showTrends })),

      addEmotionLog: (emotion) =>
        set((state) => ({
          emotionHistory: [
            ...state.emotionHistory,
            { timestamp: new Date().toISOString(), emotion },
          ],
        })),

      addJournalEntry: (entryData) =>
        set((state) => {
          const newEntry: JournalEntry = {
            ...entryData,
            id: Date.now(),
            timestamp: new Date().toISOString(),
          };
          // If it's an auto entry, also log the emotion separately
          if (entryData.type === 'auto') {
             const emotion = entryData.content.replace('Detected emotion: ', '');
             // Directly update emotionHistory here
             return {
                journalEntries: [...state.journalEntries, newEntry],
                emotionHistory: [...state.emotionHistory, { timestamp: newEntry.timestamp, emotion }],
             };
          }
          return {
            journalEntries: [...state.journalEntries, newEntry],
          };
        }),

      addChatMessage: (messageData) =>
        set((state) => ({
          chatMessages: [
            ...state.chatMessages,
            { ...messageData, id: Date.now(), timestamp: new Date().toISOString() },
          ],
        })),
        
      clearChatHistory: () => set({ chatMessages: [] }),

      setSelectedChatModel: (model) => set({ selectedChatModel: model }),
    }),
    {
      name: 'mental-health-dashboard-storage', // Name for localStorage key
      storage: createJSONStorage(() => localStorage), // Use localStorage
    }
  )
);

// Function to be called from Journal component to add auto entry
export const addAutoJournalEntry = (emotion: string) => {
  useStore.getState().addJournalEntry({
    type: 'auto',
    content: `Detected emotion: ${emotion}`,
  });
};

