
import { useState, useCallback, useEffect } from 'react';
import { Note, defaultNotes } from '@/lib/data';
import { toast } from 'sonner';

// Storage key constant
const STORAGE_KEY = 'sticky-ideas';

// Helper to safely parse dates when loading from storage
const deserializeNote = (note: any): Note => {
  return {
    ...note,
    createdAt: new Date(note.createdAt),
    updatedAt: new Date(note.updatedAt),
    // Ensure position is properly restored if it exists
    position: note.position ? {
      x: Number(note.position.x),
      y: Number(note.position.y)
    } : undefined,
    // Ensure width/height are properly restored
    width: note.width ? Number(note.width) : undefined,
    height: note.height ? Number(note.height) : undefined
  };
};

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>(() => {
    try {
      // Load notes from localStorage or use defaults
      const savedNotes = localStorage.getItem(STORAGE_KEY);
      console.log("Loading notes from localStorage:", savedNotes);
      
      if (savedNotes) {
        // Parse the JSON and ensure dates are properly deserialized
        const parsedNotes = JSON.parse(savedNotes);
        console.log("Parsed notes:", parsedNotes);
        return Array.isArray(parsedNotes) 
          ? parsedNotes.map(deserializeNote)
          : defaultNotes;
      }
      
      console.log("No saved notes found, using default notes");
      // Add default positions to default notes if they don't exist
      return defaultNotes.map((note, index) => ({
        ...note,
        position: note.position || {
          x: 100 + (index * 50),
          y: 100 + (index * 30)
        }
      }));
    } catch (error) {
      console.error('Failed to load notes from localStorage:', error);
      return defaultNotes;
    }
  });

  // Save notes to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
      console.log("Saved notes to localStorage:", notes);
    } catch (error) {
      console.error('Failed to save notes to localStorage:', error);
      toast.error('Failed to save your notes. You may be in private browsing mode.');
    }
  }, [notes]);

  const addNote = useCallback((note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newNote: Note = {
      ...note,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    setNotes(prev => [newNote, ...prev]);
    toast.success('Note created');
    console.log("Note added:", newNote);
    return newNote;
  }, []);

  const updateNote = useCallback((id: string, updates: Partial<Omit<Note, 'id' | 'createdAt'>>) => {
    console.log("Updating note:", id, updates);
    setNotes(prev => 
      prev.map(note => 
        note.id === id 
          ? { ...note, ...updates, updatedAt: new Date() } 
          : note
      )
    );
  }, []);

  const deleteNote = useCallback((id: string) => {
    console.log("Deleting note:", id);
    setNotes(prev => prev.filter(note => note.id !== id));
    toast.success('Note deleted');
  }, []);

  return {
    notes,
    addNote,
    updateNote,
    deleteNote
  };
}
