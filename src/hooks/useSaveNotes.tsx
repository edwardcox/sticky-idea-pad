
import { useEffect } from 'react';
import { Note } from '@/lib/data';
import { toast } from 'sonner';
import { saveAllNotes } from '@/lib/indexedDb';
import { generateRandomPosition } from '@/lib/utils/positionUtils';

export function useSaveNotes(
  notes: Note[], 
  isLoading: boolean, 
  isUserLoaded: boolean, 
  storeId: string,
  indexedDBAvailable: boolean = true
) {
  // Save notes to IndexedDB whenever they change
  useEffect(() => {
    const saveNotes = async () => {
      try {
        // Skip saving if IndexedDB is not available
        if (!indexedDBAvailable) {
          console.log("IndexedDB not available, skipping save operation");
          return;
        }
        
        if (notes.length === 0 || isLoading || !isUserLoaded) {
          console.warn("No notes to save or still loading, skipping IndexedDB update");
          return;
        }
        
        // Ensure all notes have valid positions before saving
        const notesToSave = notes.map(note => ({
          ...note,
          position: note.position && typeof note.position.x === 'number' && typeof note.position.y === 'number'
            ? note.position
            : generateRandomPosition()
        }));
        
        await saveAllNotes(notesToSave, storeId);
        console.log(`Saved notes to IndexedDB for ${storeId}:`, notesToSave);
      } catch (error) {
        console.error('Failed to save notes to IndexedDB:', error);
        // Don't show error toast every time to avoid spamming the user
      }
    };

    // Add a debounce to avoid frequent saves
    const timeoutId = setTimeout(() => {
      saveNotes();
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [notes, isLoading, isUserLoaded, storeId, indexedDBAvailable]);
}
