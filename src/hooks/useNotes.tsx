
import { useCallback, useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useLoadNotes } from './useLoadNotes';
import { useSaveNotes } from './useSaveNotes';
import { useNoteCrud } from './useNoteCrud';
import { toast } from 'sonner';

// Check if we're in development without a Clerk key
const isDevelopmentWithoutKey = import.meta.env.DEV && !import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// Check if IndexedDB is available in this browser/environment
const isIndexedDBAvailable = () => {
  try {
    return typeof indexedDB !== 'undefined';
  } catch (e) {
    return false;
  }
};

export function useNotes() {
  const { user, isLoaded: isUserLoaded } = useUser();
  const [indexedDBAvailable, setIndexedDBAvailable] = useState(true);
  
  // Check IndexedDB availability once component mounts
  useEffect(() => {
    const available = isIndexedDBAvailable();
    setIndexedDBAvailable(available);
    
    if (!available) {
      toast.error('Your browser does not support or blocks IndexedDB. Notes will not be saved.');
      console.error('IndexedDB is not available in this environment');
    }
  }, []);
  
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
  const { notes, setNotes, isLoading } = useLoadNotes(storeId, effectiveUserLoaded, indexedDBAvailable);
  
  // Save notes to database when they change
  useSaveNotes(notes, isLoading, effectiveUserLoaded, storeId, indexedDBAvailable);
  
  // CRUD operations for notes
  const { addNote, updateNote, deleteNote } = useNoteCrud(setNotes, storeId, indexedDBAvailable);

  return {
    notes,
    addNote,
    updateNote,
    deleteNote,
    isLoading
  };
}
