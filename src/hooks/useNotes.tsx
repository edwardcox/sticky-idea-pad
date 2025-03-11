
import { useCallback } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useLoadNotes } from './useLoadNotes';
import { useSaveNotes } from './useSaveNotes';
import { useNoteCrud } from './useNoteCrud';

// Check if we're in development without a Clerk key
const isDevelopmentWithoutKey = import.meta.env.DEV && !import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

export function useNotes() {
  const { user, isLoaded: isUserLoaded } = useUser();
  
  // Create a user-specific store name for IndexedDB
  const getUserStoreId = useCallback(() => {
    if (isDevelopmentWithoutKey) {
      return 'notes-development';
    }
    return user?.id ? `notes-${user.id}` : 'notes-anonymous';
  }, [user?.id]);

  const storeId = getUserStoreId();
  
  // In development mode without a key, assume user is always loaded
  const effectiveUserLoaded = isDevelopmentWithoutKey ? true : isUserLoaded;
  
  // Load notes from database
  const { notes, setNotes, isLoading } = useLoadNotes(storeId, effectiveUserLoaded);
  
  // Save notes to database when they change
  useSaveNotes(notes, isLoading, effectiveUserLoaded, storeId);
  
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
