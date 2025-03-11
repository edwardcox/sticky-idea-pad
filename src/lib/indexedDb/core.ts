
import { DB_NAME, DB_VERSION, DEFAULT_STORE } from './config';

// Initialize the database with a specific store name for the user
export const initDB = (storeName: string = DEFAULT_STORE): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    try {
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
    } catch (error) {
      // Handle any exceptions that might occur when accessing indexedDB
      console.error('IndexedDB initialization error:', error);
      reject('IndexedDB is not available or permission denied');
    }
  });
};
