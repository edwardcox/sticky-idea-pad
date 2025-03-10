
import { Note } from '../data';

// Helper to ensure dates are properly converted
export const serializeNote = (note: Note) => {
  // Deep clone to prevent mutation of the original object
  const serialized = JSON.parse(JSON.stringify(note));
  
  // Ensure dates are serializable
  serialized.createdAt = note.createdAt.toISOString();
  serialized.updatedAt = note.updatedAt.toISOString();
  
  // Ensure position is properly serialized
  if (note.position) {
    serialized.position = {
      x: Number(note.position.x),
      y: Number(note.position.y)
    };
  }
  
  return serialized;
};

// Helper to deserialize note from DB format
export const deserializeNote = (dbNote: any): Note => {
  // Convert date strings back to Date objects
  const note = {
    ...dbNote,
    createdAt: new Date(dbNote.createdAt),
    updatedAt: new Date(dbNote.updatedAt)
  };
  
  // Ensure position is a valid object with numeric values
  if (dbNote.position) {
    note.position = {
      x: Number(dbNote.position.x),
      y: Number(dbNote.position.y)
    };
  }
  
  return note;
};
