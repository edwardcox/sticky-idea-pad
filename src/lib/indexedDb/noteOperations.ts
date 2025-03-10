
import { Note } from '../data';
import { initDB } from './core';
import { serializeNote, deserializeNote } from './serialization';
import { DEFAULT_STORE } from './config';

// Get all notes from the database
export const getAllNotes = async (storeName: string = DEFAULT_STORE): Promise<Note[]> => {
  try {
    const db = await initDB(storeName);
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => {
        const notes = request.result.map(deserializeNote);
        resolve(notes);
      };

      request.onerror = (event) => {
        console.error('Error getting notes:', event);
        reject('Failed to get notes from IndexedDB');
      };

      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error('Failed to get notes from IndexedDB:', error);
    throw error;
  }
};

// Save notes to the database
export const saveAllNotes = async (notes: Note[], storeName: string = DEFAULT_STORE): Promise<void> => {
  try {
    const db = await initDB(storeName);
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);

    // Clear current data
    store.clear();

    // Add each note
    for (const note of notes) {
      const serializedNote = serializeNote(note);
      store.add(serializedNote);
    }

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => {
        db.close();
        resolve();
      };

      transaction.onerror = (event) => {
        console.error('Error saving notes:', event);
        reject('Failed to save notes to IndexedDB');
      };
    });
  } catch (error) {
    console.error('Failed to save notes to IndexedDB:', error);
    throw error;
  }
};

// Add a single note to the database
export const addNote = async (note: Note, storeName: string = DEFAULT_STORE): Promise<void> => {
  try {
    const db = await initDB(storeName);
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);

    const serializedNote = serializeNote(note);
    store.add(serializedNote);

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => {
        db.close();
        resolve();
      };

      transaction.onerror = (event) => {
        console.error('Error adding note:', event);
        reject('Failed to add note to IndexedDB');
      };
    });
  } catch (error) {
    console.error('Failed to add note to IndexedDB:', error);
    throw error;
  }
};

// Update a note in the database
export const updateNote = async (id: string, updates: Partial<Note>, storeName: string = DEFAULT_STORE): Promise<void> => {
  try {
    const db = await initDB(storeName);
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.get(id);

    request.onsuccess = () => {
      const note = request.result;
      if (note) {
        // Ensure position is properly updated if it exists
        const updatedPosition = updates.position ? {
          x: Number(updates.position.x),
          y: Number(updates.position.y)
        } : note.position;
        
        const updatedNote = {
          ...note,
          ...updates,
          position: updatedPosition,
          updatedAt: new Date().toISOString()
        };
        
        store.put(updatedNote);
      }
    };

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => {
        db.close();
        resolve();
      };

      transaction.onerror = (event) => {
        console.error('Error updating note:', event);
        reject('Failed to update note in IndexedDB');
      };
    });
  } catch (error) {
    console.error('Failed to update note in IndexedDB:', error);
    throw error;
  }
};

// Delete a note from the database
export const deleteNote = async (id: string, storeName: string = DEFAULT_STORE): Promise<void> => {
  try {
    const db = await initDB(storeName);
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    
    store.delete(id);

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => {
        db.close();
        resolve();
      };

      transaction.onerror = (event) => {
        console.error('Error deleting note:', event);
        reject('Failed to delete note from IndexedDB');
      };
    });
  } catch (error) {
    console.error('Failed to delete note from IndexedDB:', error);
    throw error;
  }
};
