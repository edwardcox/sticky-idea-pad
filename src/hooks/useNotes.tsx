
import { useState, useCallback, useEffect } from 'react';
import { Note, defaultNotes } from '@/lib/data';
import { toast } from 'sonner';
import { 
  getAllNotes, 
  saveAllNotes, 
  addNote as addNoteToDb, 
  updateNote as updateNoteInDb, 
  deleteNote as deleteNoteFromDb 
} from '@/lib/indexedDb';
import { useUser } from '@clerk/clerk-react';

// Helper to generate a random position within the expanded viewport
const generateRandomPosition = () => {
  // Get window dimensions with multipliers to create a larger workspace
  const maxX = typeof window !== 'undefined' ? Math.max(window.innerWidth * 1.8, 1800) : 1800;
  const maxY = typeof window !== 'undefined' ? Math.max(window.innerHeight * 3.5, 3500) : 3500;
  
  return {
    x: Math.floor(Math.random() * maxX) + 50,
    y: Math.floor(Math.random() * maxY) + 50
  };
};

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isLoaded: isUserLoaded } = useUser();
  
  // Create a user-specific store name for IndexedDB
  const getUserStoreId = useCallback(() => {
    return user?.id ? `notes-${user.id}` : 'notes-anonymous';
  }, [user?.id]);

  // Load notes from IndexedDB on component mount or when user changes
  useEffect(() => {
    const loadNotes = async () => {
      // Wait for user to be loaded before loading notes
      if (!isUserLoaded) return;
      
      try {
        setIsLoading(true);
        const storeId = getUserStoreId();
        const savedNotes = await getAllNotes(storeId);
        console.log(`Loading notes for ${storeId} from IndexedDB:`, savedNotes);
        
        if (savedNotes && savedNotes.length > 0) {
          // Ensure all notes have valid positions
          const notesWithValidPositions = savedNotes.map(note => ({
            ...note,
            position: note.position && typeof note.position.x === 'number' && typeof note.position.y === 'number'
              ? note.position
              : generateRandomPosition(),
            width: note.width || 280
          }));
          setNotes(notesWithValidPositions);
          
          // If positions were fixed, update in DB
          if (JSON.stringify(notesWithValidPositions) !== JSON.stringify(savedNotes)) {
            console.log("Updating notes with valid positions");
            await saveAllNotes(notesWithValidPositions, storeId);
          }
        } else {
          console.log("No saved notes found, using default notes");
          // Add default positions to default notes if they don't exist
          const notesWithPositions = defaultNotes.map((note, index) => ({
            ...note,
            position: {
              x: 100 + (index * 50),
              y: 100 + (index * 150)
            },
            width: note.width || 280
          }));
          setNotes(notesWithPositions);
          // Save default notes to IndexedDB
          await saveAllNotes(notesWithPositions, storeId);
        }
      } catch (error) {
        console.error('Failed to load notes from IndexedDB:', error);
        toast.error('Failed to load your notes. Using defaults instead.');
        
        // Fallback to default notes
        const notesWithPositions = defaultNotes.map((note, index) => ({
          ...note,
          position: {
            x: 100 + (index * 50),
            y: 100 + (index * 150)
          },
          width: note.width || 280
        }));
        setNotes(notesWithPositions);
      } finally {
        setIsLoading(false);
      }
    };

    loadNotes();
  }, [isUserLoaded, getUserStoreId]);

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
        
        const storeId = getUserStoreId();
        await saveAllNotes(notesToSave, storeId);
        console.log(`Saved notes to IndexedDB for ${storeId}:`, notesToSave);
      } catch (error) {
        console.error('Failed to save notes to IndexedDB:', error);
        toast.error('Failed to save your notes.');
      }
    };

    saveNotes();
  }, [notes, isLoading, isUserLoaded, getUserStoreId]);

  const addNote = useCallback(async (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    // Ensure note has a valid position or generate a random one
    const position = note.position && 
      typeof note.position.x === 'number' && 
      typeof note.position.y === 'number' 
        ? note.position 
        : generateRandomPosition();
    
    const newNote: Note = {
      ...note,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
      position: position,
      width: note.width || 280
    };
    
    setNotes(prev => [newNote, ...prev]);
    
    try {
      const storeId = getUserStoreId();
      await addNoteToDb(newNote, storeId);
      toast.success('Note created');
      console.log("Note added:", newNote);
    } catch (error) {
      console.error('Failed to add note to IndexedDB:', error);
      toast.error('Failed to save the note.');
    }
    
    return newNote;
  }, [getUserStoreId]);

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
      const storeId = getUserStoreId();
      await updateNoteInDb(id, updates, storeId);
    } catch (error) {
      console.error('Failed to update note in IndexedDB:', error);
      toast.error('Failed to update the note.');
    }
  }, [getUserStoreId]);

  const deleteNote = useCallback(async (id: string) => {
    console.log("Deleting note:", id);
    
    setNotes(prev => prev.filter(note => note.id !== id));
    
    try {
      const storeId = getUserStoreId();
      await deleteNoteFromDb(id, storeId);
      toast.success('Note deleted');
    } catch (error) {
      console.error('Failed to delete note from IndexedDB:', error);
      toast.error('Failed to delete the note.');
    }
  }, [getUserStoreId]);

  return {
    notes,
    addNote,
    updateNote,
    deleteNote,
    isLoading
  };
}
