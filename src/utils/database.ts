/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Pet, Plant, Schedule, DiaryEntry, CareLog } from '../types';

interface SmartHomeCareDB extends DBSchema {
  pets: {
    key: string;
    value: Pet;
    indexes: {
      'by-created': string;
    };
  };
  plants: {
    key: string;
    value: Plant;
    indexes: {
      'by-created': string;
    };
  };
  schedules: {
    key: string;
    value: Schedule;
    indexes: {
      'by-entity': [string, 'pet' | 'plant'];
      'by-nextDue': string;
    };
  };
  diary_entries: {
    key: string;
    value: DiaryEntry;
    indexes: {
      'by-entity': [string, 'pet' | 'plant'];
      'by-timestamp': string;
    };
  };
  care_logs: {
    key: string;
    value: CareLog;
    indexes: {
      'by-entity': [string, 'pet' | 'plant'];
      'by-timestamp': string;
    };
  };
  settings: {
    key: string;
    value: { key: string; value: string; updated_at: string };
  };
  sync_status: {
    key: number;
    value: {
      entityType: string;
      entityId: string;
      action: 'create' | 'update' | 'delete';
      data: string;
      synced: boolean;
      created_at: string;
    };
  };
}

const DB_NAME = 'SmartHomeCareDB';
const DB_VERSION = 1;

let db: IDBPDatabase<SmartHomeCareDB> | null = null;

/**
 * Initialize IndexedDB database
 */
export async function initializeDatabase(): Promise<IDBPDatabase<SmartHomeCareDB>> {
  if (db) return db;

  db = await openDB<SmartHomeCareDB>(DB_NAME, DB_VERSION, {
    upgrade(database) {
      // Pets store
      if (!database.objectStoreNames.contains('pets')) {
        const petStore = database.createObjectStore('pets', { keyPath: 'id' });
        petStore.createIndex('by-created', 'created_at');
      }

      // Plants store
      if (!database.objectStoreNames.contains('plants')) {
        const plantStore = database.createObjectStore('plants', { keyPath: 'id' });
        plantStore.createIndex('by-created', 'created_at');
      }

      // Schedules store
      if (!database.objectStoreNames.contains('schedules')) {
        const scheduleStore = database.createObjectStore('schedules', { keyPath: 'id' });
        scheduleStore.createIndex('by-entity', ['entityId', 'entityType']);
        scheduleStore.createIndex('by-nextDue', 'nextDue');
      }

      // Diary entries store
      if (!database.objectStoreNames.contains('diary_entries')) {
        const diaryStore = database.createObjectStore('diary_entries', { keyPath: 'id' });
        diaryStore.createIndex('by-entity', ['entityId', 'entityType']);
        diaryStore.createIndex('by-timestamp', 'timestamp');
      }

      // Care logs store
      if (!database.objectStoreNames.contains('care_logs')) {
        const logStore = database.createObjectStore('care_logs', { keyPath: 'id' });
        logStore.createIndex('by-entity', ['entityId', 'entityType']);
        logStore.createIndex('by-timestamp', 'timestamp');
      }

      // Settings store
      if (!database.objectStoreNames.contains('settings')) {
        database.createObjectStore('settings', { keyPath: 'key' });
      }

      // Sync status store
      if (!database.objectStoreNames.contains('sync_status')) {
        database.createObjectStore('sync_status', { keyPath: 'id', autoIncrement: true });
      }
    },
  });

  return db;
}

/**
 * Get database instance
 */
export async function getDatabase(): Promise<IDBPDatabase<SmartHomeCareDB>> {
  if (!db) {
    return initializeDatabase();
  }
  return db;
}

/**
 * Close database connection
 */
export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
  }
}

/**
 * Reset database (delete and recreate)
 */
export async function resetDatabase(): Promise<void> {
  if (db) {
    await db.close();
    db = null;
  }
  
  await new Promise<void>((resolve, reject) => {
    const request = indexedDB.deleteDatabase(DB_NAME);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });

  await initializeDatabase();
}

/**
 * Check if database has initial data
 */
export async function hasInitialData(): Promise<boolean> {
  const database = await getDatabase();
  
  const petCount = await database.count('pets');
  const plantCount = await database.count('plants');
  
  return petCount > 0 || plantCount > 0;
}
