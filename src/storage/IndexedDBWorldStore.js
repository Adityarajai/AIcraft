const DATABASE_NAME = "aicraft-worlds";
const DATABASE_VERSION = 1;
const STORE_NAME = "worlds";

export class IndexedDBWorldStore {
  constructor() {
    this.databasePromise = null;
  }

  open() {
    if (this.databasePromise) return this.databasePromise;
    this.databasePromise = new Promise((resolve, reject) => {
      if (!globalThis.indexedDB) {
        reject(new Error("IndexedDB is not available in this browser"));
        return;
      }

      const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
      request.onupgradeneeded = () => {
        const database = request.result;
        if (!database.objectStoreNames.contains(STORE_NAME)) {
          database.createObjectStore(STORE_NAME, { keyPath: "id" });
        }
      };
      request.onsuccess = () => {
        const database = request.result;
        database.onversionchange = () => database.close();
        resolve(database);
      };
      request.onerror = () => reject(request.error ?? new Error("Could not open the world database"));
      request.onblocked = () => reject(new Error("World database upgrade is blocked by another tab"));
    }).catch((error) => {
      this.databasePromise = null;
      throw error;
    });
    return this.databasePromise;
  }

  async load(id) {
    const database = await this.open();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, "readonly");
      const request = transaction.objectStore(STORE_NAME).get(id);
      request.onsuccess = () => resolve(request.result?.data ?? null);
      request.onerror = () => reject(request.error ?? new Error("Could not load the saved world"));
      transaction.onabort = () => reject(transaction.error ?? new Error("World load was aborted"));
    });
  }

  async save(id, data) {
    const database = await this.open();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, "readwrite");
      transaction.objectStore(STORE_NAME).put({ id, data, savedAt: Date.now() });
      transaction.oncomplete = () => resolve(true);
      transaction.onerror = () => reject(transaction.error ?? new Error("Could not save the world"));
      transaction.onabort = () => reject(transaction.error ?? new Error("World save was aborted"));
    });
  }

  async remove(id) {
    const database = await this.open();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, "readwrite");
      transaction.objectStore(STORE_NAME).delete(id);
      transaction.oncomplete = () => resolve(true);
      transaction.onerror = () => reject(transaction.error ?? new Error("Could not delete the world"));
      transaction.onabort = () => reject(transaction.error ?? new Error("World deletion was aborted"));
    });
  }
}
