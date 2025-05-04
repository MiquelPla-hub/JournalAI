import React, { useState } from 'react'; // Removed unused useEffect import
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useStore } from '@/lib/store'; // Import the store
// Removed unused JournalEntry type import

const Journal: React.FC = () => {
  // Get journal entries and the action to add entries from the store
  const journalEntries = useStore((state) => state.journalEntries);
  const addJournalEntry = useStore((state) => state.addJournalEntry);

  const [newManualEntry, setNewManualEntry] = useState('');

  const handleAddManualEntry = () => {
    if (newManualEntry.trim() === '') return;
    // Call the store action to add a manual entry
    addJournalEntry({
      type: 'manual',
      content: newManualEntry,
    });
    setNewManualEntry(''); // Clear the input field
  };

  // Sort entries by timestamp for display (newest first)
  const sortedEntries = [...journalEntries].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="bg-white p-4 rounded-lg shadow border border-blue-200 h-96 flex flex-col">
      <h3 className="text-lg font-semibold mb-2 text-blue-700">Journal</h3>
      <ScrollArea className="flex-grow border rounded p-2 mb-2 bg-blue-50/30">
        {sortedEntries.length === 0 ? (
          <p className="text-sm text-gray-500">No entries yet. Detected emotions and manual notes will appear here.</p>
        ) : (
          sortedEntries.map((entry) => (
            <div key={entry.id} className="mb-2 p-2 border-b last:border-b-0">
              <p className={`text-sm ${entry.type === 'auto' ? 'text-gray-600 italic' : 'text-gray-800'}`}>{entry.content}</p>
              <p className="text-xs text-gray-400">{new Date(entry.timestamp).toLocaleString()} {entry.type === 'auto' ? '(Auto-Detected)' : ''}</p>
              {/* TODO: Add notes functionality here */}
              {/* Example: <Button size="sm" variant="link">Add Note</Button> */}
            </div>
          ))
        )}
      </ScrollArea>
      <div className="flex flex-col space-y-2">
        <Textarea
          placeholder="How are you feeling? Add a manual entry..."
          value={newManualEntry}
          onChange={(e) => setNewManualEntry(e.target.value)}
          className="resize-none"
          rows={3}
          onKeyPress={(e) => {
            // Optional: Submit on Ctrl+Enter or Cmd+Enter
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
              handleAddManualEntry();
            }
          }}
        />
        <Button onClick={handleAddManualEntry} className="bg-blue-600 hover:bg-blue-700 text-white">
          Add Manual Entry
        </Button>
      </div>
    </div>
  );
};

export default Journal;

