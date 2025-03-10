
import { Note } from './data';

const DB_NAME = 'sticky-ideas-db';
const DB_VERSION = 1;
const DEFAULT_STORE = 'notes';

// Initialize the database with a specific store name for the user
export const initDB = (storeName: string = DEFAULT_STORE): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error('IndexedDB error:', event);
      reject('Error opening IndexedDB');
    };

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Check if the store exists, if not create it
      if (!db.objectStoreNames.contains(storeName)) {
        // Close the current database connection
        db.close();
        
        // Increase version to trigger onupgradeneeded
        const newRequest = indexedDB.open(DB_NAME, DB_VERSION + 1);
        
        newRequest.onupgradeneeded = (e) => {
          const db = (e.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains(storeName)) {
            db.createObjectStore(storeName, { keyPath: 'id' });
          }
        };
        
        newRequest.onsuccess = (e) => {
          resolve((e.target as IDBOpenDBRequest).result);
        };
        
        newRequest.onerror = (e) => {
          console.error('Error upgrading IndexedDB:', e);
          reject('Error upgrading IndexedDB');
        };
      } else {
        resolve(db);
      }
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      // Create object store if it doesn't exist
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName, { keyPath: 'id' });
      }
      // Also create the default store if not exists
      if (!db.objectStoreNames.contains(DEFAULT_STORE)) {
        db.createObjectStore(DEFAULT_STORE, { keyPath: 'id' });
      }
    };
  });
};

// Helper to ensure dates are properly converted
const serializeNote = (note: Note) => {
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
const deserializeNote = (dbNote: any): Note => {
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
