
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
      x: Number(note.position.x) || 0,
      y: Number(note.position.y) || 0
    } : { x: 100, y: 100 }, // Always provide a default position
    // Ensure width/height are properly restored
    width: note.width ? Number(note.width) : 280, // Default width
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
        
        if (Array.isArray(parsedNotes) && parsedNotes.length > 0) {
          return parsedNotes.map(deserializeNote);
        }
      }
      
      console.log("No saved notes found or invalid format, using default notes");
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
      toast.error('Failed to load your notes. Using defaults instead.');
      return defaultNotes.map((note, index) => ({
        ...note,
        position: {
          x: 100 + (index * 50),
          y: 100 + (index * 30)
        }
      }));
    }
  });

  // Save notes to localStorage whenever they change
  useEffect(() => {
    try {
      if (notes.length === 0) {
        console.warn("No notes to save, skipping localStorage update");
        return;
      }
      
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
      // Ensure new note has a valid position
      position: note.position || { x: 100, y: 100 },
      width: note.width || 280
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
