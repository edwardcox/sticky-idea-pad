
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
    updatedAt: new Date(note.updatedAt)
  };
};

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>(() => {
    try {
      // Load notes from localStorage or use defaults
      const savedNotes = localStorage.getItem(STORAGE_KEY);
      
      if (savedNotes) {
        // Parse the JSON and ensure dates are properly deserialized
        const parsedNotes = JSON.parse(savedNotes);
        return Array.isArray(parsedNotes) 
          ? parsedNotes.map(deserializeNote)
          : defaultNotes;
      }
      
      return defaultNotes;
    } catch (error) {
      console.error('Failed to load notes from localStorage:', error);
      return defaultNotes;
    }
  });

  // Save notes to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
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
    return newNote;
  }, []);

  const updateNote = useCallback((id: string, updates: Partial<Omit<Note, 'id' | 'createdAt'>>) => {
    setNotes(prev => 
      prev.map(note => 
        note.id === id 
          ? { ...note, ...updates, updatedAt: new Date() } 
          : note
      )
    );
    toast.success('Note updated');
  }, []);

  const deleteNote = useCallback((id: string) => {
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
