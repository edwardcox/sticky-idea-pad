
import { Note } from './data';

const DB_NAME = 'sticky-ideas-db';
const DB_VERSION = 1;
const NOTES_STORE = 'notes';

// Initialize the database
export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error('IndexedDB error:', event);
      reject('Error opening IndexedDB');
    };

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      // Create object store for notes if it doesn't exist
      if (!db.objectStoreNames.contains(NOTES_STORE)) {
        db.createObjectStore(NOTES_STORE, { keyPath: 'id' });
      }
    };
  });
};

// Get all notes from the database
export const getAllNotes = async (): Promise<Note[]> => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(NOTES_STORE, 'readonly');
      const store = transaction.objectStore(NOTES_STORE);
      const request = store.getAll();

      request.onsuccess = () => {
        const notes = request.result.map(note => ({
          ...note,
          createdAt: new Date(note.createdAt),
          updatedAt: new Date(note.updatedAt)
        }));
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
export const saveAllNotes = async (notes: Note[]): Promise<void> => {
  try {
    const db = await initDB();
    const transaction = db.transaction(NOTES_STORE, 'readwrite');
    const store = transaction.objectStore(NOTES_STORE);

    // Clear current data
    store.clear();

    // Add each note
    for (const note of notes) {
      store.add({
        ...note,
        // Ensure dates are serializable
        createdAt: note.createdAt.toISOString(),
        updatedAt: note.updatedAt.toISOString()
      });
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
export const addNote = async (note: Note): Promise<void> => {
  try {
    const db = await initDB();
    const transaction = db.transaction(NOTES_STORE, 'readwrite');
    const store = transaction.objectStore(NOTES_STORE);

    store.add({
      ...note,
      createdAt: note.createdAt.toISOString(),
      updatedAt: note.updatedAt.toISOString()
    });

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
export const updateNote = async (id: string, updates: Partial<Note>): Promise<void> => {
  try {
    const db = await initDB();
    const transaction = db.transaction(NOTES_STORE, 'readwrite');
    const store = transaction.objectStore(NOTES_STORE);
    const request = store.get(id);

    request.onsuccess = () => {
      const note = request.result;
      if (note) {
        const updatedNote = {
          ...note,
          ...updates,
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
export const deleteNote = async (id: string): Promise<void> => {
  try {
    const db = await initDB();
    const transaction = db.transaction(NOTES_STORE, 'readwrite');
    const store = transaction.objectStore(NOTES_STORE);
    
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
