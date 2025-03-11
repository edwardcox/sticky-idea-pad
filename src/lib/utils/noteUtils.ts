
import { Note, defaultNotes } from '@/lib/data';
import { generateRandomPosition, ensureValidPosition } from './positionUtils';

// Prepares notes by ensuring valid positions and widths
export const prepareNotesWithValidPositions = (notes: Note[]) => {
  return notes.map(note => ({
    ...note,
    position: ensureValidPosition(note.position),
    width: note.width || 280
  }));
};

// Creates a set of default notes with positions
export const createDefaultNotesWithPositions = () => {
  return defaultNotes.map((note, index) => ({
    ...note,
    position: {
      x: 100 + (index * 50),
      y: 100 + (index * 150)
    },
    width: note.width || 280
  }));
};

// Creates a new note with all required fields
export const createNewNote = (noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
  // Ensure note has a valid position or generate a random one
  const position = noteData.position && 
    typeof noteData.position.x === 'number' && 
    typeof noteData.position.y === 'number' 
      ? noteData.position 
      : generateRandomPosition();
  
  return {
    ...noteData,
    id: crypto.randomUUID(),
    createdAt: new Date(),
    updatedAt: new Date(),
    position: position,
    width: noteData.width || 280
  };
};
