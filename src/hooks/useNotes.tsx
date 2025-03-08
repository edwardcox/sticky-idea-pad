
import { useState, useCallback, useEffect } from 'react';
import { Note, defaultNotes } from '@/lib/data';
import { toast } from 'sonner';

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>(() => {
    // Load notes from localStorage or use defaults
    const savedNotes = localStorage.getItem('sticky-notes');
    return savedNotes ? JSON.parse(savedNotes) : defaultNotes;
  });

  // Save notes to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('sticky-notes', JSON.stringify(notes));
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
