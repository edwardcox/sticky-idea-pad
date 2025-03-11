
import { useEffect } from 'react';
import { Note } from '@/lib/data';
import { toast } from 'sonner';
import { saveAllNotes } from '@/lib/indexedDb';
import { generateRandomPosition } from '@/lib/utils/positionUtils';

export function useSaveNotes(
  notes: Note[], 
  isLoading: boolean, 
  isUserLoaded: boolean, 
  storeId: string
) {
  // Save notes to IndexedDB whenever they change
  useEffect(() => {
    const saveNotes = async () => {
      try {
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
        toast.error('Failed to save your notes.');
      }
    };

    saveNotes();
  }, [notes, isLoading, isUserLoaded, storeId]);
}
