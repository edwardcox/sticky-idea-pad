
import { useCallback } from 'react';
import { Note } from '@/lib/data';
import { toast } from 'sonner';
import { 
  addNote as addNoteToDb, 
  updateNote as updateNoteInDb, 
  deleteNote as deleteNoteFromDb 
} from '@/lib/indexedDb';
import { createNewNote } from '@/lib/utils/noteUtils';

export function useNoteCrud(
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>,
  storeId: string,
  indexedDBAvailable: boolean = true
) {
  const addNote = useCallback(async (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newNote = createNewNote(note);
    
    setNotes(prev => [newNote, ...prev]);
    
    if (indexedDBAvailable) {
      try {
        await addNoteToDb(newNote, storeId);
        toast.success('Note created');
        console.log("Note added:", newNote);
      } catch (error) {
        console.error('Failed to add note to IndexedDB:', error);
        // Don't show error toast to avoid confusion
      }
    } else {
      toast.success('Note created (not saved to database)');
    }
    
    return newNote;
  }, [setNotes, storeId, indexedDBAvailable]);

  const updateNote = useCallback(async (id: string, updates: Partial<Omit<Note, 'id' | 'createdAt'>>) => {
    console.log("Updating note:", id, updates);
    
    setNotes(prev => 
      prev.map(note => 
        note.id === id 
          ? { 
              ...note, 
              ...updates, 
              updatedAt: new Date(),
              // Ensure position remains valid if it's being updated
              position: updates.position ? {
                x: Number(updates.position.x) || 0,
                y: Number(updates.position.y) || 0
              } : note.position
            } 
          : note
      )
    );
    
    if (indexedDBAvailable) {
      try {
        await updateNoteInDb(id, updates, storeId);
      } catch (error) {
        console.error('Failed to update note in IndexedDB:', error);
        // Don't show error toast to avoid confusion
      }
    }
  }, [setNotes, storeId, indexedDBAvailable]);

  const deleteNote = useCallback(async (id: string) => {
    console.log("Deleting note:", id);
    
    setNotes(prev => prev.filter(note => note.id !== id));
    
    if (indexedDBAvailable) {
      try {
        await deleteNoteFromDb(id, storeId);
        toast.success('Note deleted');
      } catch (error) {
        console.error('Failed to delete note from IndexedDB:', error);
        // Don't show error toast to avoid confusion
      }
    } else {
      toast.success('Note deleted (not saved to database)');
    }
  }, [setNotes, storeId, indexedDBAvailable]);

  return { addNote, updateNote, deleteNote };
}
