
// Main barrel file to export all IndexedDB functionality
import { initDB } from './core';
import { 
  getAllNotes, 
  saveAllNotes, 
  addNote, 
  updateNote, 
  deleteNote 
} from './noteOperations';

export {
  initDB,
  getAllNotes,
  saveAllNotes,
  addNote,
  updateNote,
  deleteNote
};
