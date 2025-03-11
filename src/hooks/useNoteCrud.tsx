
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
  storeId: string
) {
  const addNote = useCallback(async (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newNote = createNewNote(note);
    
    setNotes(prev => [newNote, ...prev]);
    
    try {
      await addNoteToDb(newNote, storeId);
      toast.success('Note created');
      console.log("Note added:", newNote);
    } catch (error) {
      console.error('Failed to add note to IndexedDB:', error);
      toast.error('Failed to save the note.');
    }
    
    return newNote;
  }, [setNotes, storeId]);

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
    
    try {
      await updateNoteInDb(id, updates, storeId);
    } catch (error) {
      console.error('Failed to update note in IndexedDB:', error);
      toast.error('Failed to update the note.');
    }
  }, [setNotes, storeId]);

  const deleteNote = useCallback(async (id: string) => {
    console.log("Deleting note:", id);
    
    setNotes(prev => prev.filter(note => note.id !== id));
    
    try {
      await deleteNoteFromDb(id, storeId);
      toast.success('Note deleted');
    } catch (error) {
      console.error('Failed to delete note from IndexedDB:', error);
      toast.error('Failed to delete the note.');
    }
  }, [setNotes, storeId]);

  return { addNote, updateNote, deleteNote };
}
