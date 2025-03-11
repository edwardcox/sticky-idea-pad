
import { useCallback } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useLoadNotes } from './useLoadNotes';
import { useSaveNotes } from './useSaveNotes';
import { useNoteCrud } from './useNoteCrud';

export function useNotes() {
  const { user, isLoaded: isUserLoaded } = useUser();
  
  // Create a user-specific store name for IndexedDB
  const getUserStoreId = useCallback(() => {
    return user?.id ? `notes-${user.id}` : 'notes-anonymous';
  }, [user?.id]);

  const storeId = getUserStoreId();
  
  // Load notes from database
  const { notes, setNotes, isLoading } = useLoadNotes(storeId, isUserLoaded);
  
  // Save notes to database when they change
  useSaveNotes(notes, isLoading, isUserLoaded, storeId);
  
  // CRUD operations for notes
  const { addNote, updateNote, deleteNote } = useNoteCrud(setNotes, storeId);

  return {
    notes,
    addNote,
    updateNote,
    deleteNote,
    isLoading
  };
}
