
import { useState, useEffect } from 'react';
import { Note } from '@/lib/data';
import { toast } from 'sonner';
import { getAllNotes, saveAllNotes } from '@/lib/indexedDb';
import { prepareNotesWithValidPositions, createDefaultNotesWithPositions } from '@/lib/utils/noteUtils';

export function useLoadNotes(storeId: string, isUserLoaded: boolean) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load notes from IndexedDB on component mount or when user changes
  useEffect(() => {
    const loadNotes = async () => {
      // Wait for user to be loaded before loading notes
      if (!isUserLoaded) return;
      
      try {
        setIsLoading(true);
        const savedNotes = await getAllNotes(storeId);
        console.log(`Loading notes for ${storeId} from IndexedDB:`, savedNotes);
        
        if (savedNotes && savedNotes.length > 0) {
          // Ensure all notes have valid positions
          const notesWithValidPositions = prepareNotesWithValidPositions(savedNotes);
          setNotes(notesWithValidPositions);
          
          // If positions were fixed, update in DB
          if (JSON.stringify(notesWithValidPositions) !== JSON.stringify(savedNotes)) {
            console.log("Updating notes with valid positions");
            await saveAllNotes(notesWithValidPositions, storeId);
          }
        } else {
          console.log("No saved notes found, using default notes");
          // Add default positions to default notes if they don't exist
          const defaultWithPositions = createDefaultNotesWithPositions();
          setNotes(defaultWithPositions);
          // Save default notes to IndexedDB
          await saveAllNotes(defaultWithPositions, storeId);
        }
      } catch (error) {
        console.error('Failed to load notes from IndexedDB:', error);
        toast.error('Failed to load your notes. Using defaults instead.');
        
        // Fallback to default notes
        const defaultWithPositions = createDefaultNotesWithPositions();
        setNotes(defaultWithPositions);
      } finally {
        setIsLoading(false);
      }
    };

    loadNotes();
  }, [isUserLoaded, storeId]);

  return { notes, setNotes, isLoading };
}
