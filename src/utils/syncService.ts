/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Pet, Plant, Schedule, DiaryEntry, CareLog } from '../types';
import {
  addSyncRecord,
  getPendingSyncRecords,
  markSyncRecordAsSynced,
  clearSyncedRecords
} from './dbService';

/**
 * Sync Service
 * Handles offline/online synchronization with a backend API
 */

export interface SyncConfig {
  apiEndpoint?: string;
  apiKey?: string;
  autoSyncOnOnline: boolean;
  syncInterval: number; // milliseconds
}

const DEFAULT_SYNC_CONFIG: SyncConfig = {
  autoSyncOnOnline: true,
  syncInterval: 60000, // 1 minute
};

let syncConfig: SyncConfig = DEFAULT_SYNC_CONFIG;
let syncIntervalId: number | null = null;

/**
 * Configure sync service
 */
export function configureSync(config: Partial<SyncConfig>): void {
  syncConfig = { ...syncConfig, ...config };
}

/**
 * Track a change for sync (create/update/delete)
 */
export function trackChange(
  entityType: 'pet' | 'plant' | 'schedule' | 'diary' | 'log' | 'setting',
  entityId: string,
  action: 'create' | 'update' | 'delete',
  data: any
): void {
  addSyncRecord(entityType, entityId, action, data);
}

/**
 * Sync pending changes with backend
 */
export async function syncWithBackend(): Promise<{ success: number; failed: number }> {
  const pendingRecords = await getPendingSyncRecords();
  
  if (pendingRecords.length === 0) {
    return { success: 0, failed: 0 };
  }

  let successCount = 0;
  let failedCount = 0;

  // In a real implementation, this would send data to a backend API
  // For now, we simulate successful sync
  for (const record of pendingRecords) {
    try {
      // Simulate API call
      await simulateApiCall(record);
      markSyncRecordAsSynced(record.id);
      successCount++;
    } catch (error) {
      console.error(`Failed to sync record ${record.id}:`, error);
      failedCount++;
    }
  }

  // Clear synced records
  clearSyncedRecords();

  console.log(`Sync completed: ${successCount} succeeded, ${failedCount} failed`);
  return { success: successCount, failed: failedCount };
}

/**
 * Simulate API call (replace with actual API implementation)
 */
async function simulateApiCall(record: any): Promise<void> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // In a real implementation, this would be:
  // const response = await fetch(`${syncConfig.apiEndpoint}/sync`, {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //     'Authorization': `Bearer ${syncConfig.apiKey}`,
  //   },
  //   body: JSON.stringify(record),
  // });
  // if (!response.ok) throw new Error('Sync failed');
}

/**
 * Start automatic sync interval
 */
export function startAutoSync(): void {
  if (syncIntervalId !== null) {
    stopAutoSync();
  }

  syncIntervalId = window.setInterval(() => {
    if (navigator.onLine) {
      syncWithBackend();
    }
  }, syncConfig.syncInterval);
}

/**
 * Stop automatic sync interval
 */
export function stopAutoSync(): void {
  if (syncIntervalId !== null) {
    clearInterval(syncIntervalId);
    syncIntervalId = null;
  }
}

/**
 * Get sync status
 */
export async function getSyncStatus(): Promise<{
  pending: number;
  isOnline: boolean;
  lastSync: string | null;
}> {
  const pendingRecords = await getPendingSyncRecords();
  const lastSync = localStorage.getItem('care_system_last_sync');
  
  return {
    pending: pendingRecords.length,
    isOnline: navigator.onLine,
    lastSync,
  };
}

/**
 * Force immediate sync
 */
export async function forceSync(): Promise<{ success: number; failed: number }> {
  return syncWithBackend();
}

/**
 * Export all data for backup
 */
export function exportAllData(): string {
  const data = {
    pets: localStorage.getItem('care_system_pets'),
    plants: localStorage.getItem('care_system_plants'),
    schedules: localStorage.getItem('care_system_schedules'),
    diary: localStorage.getItem('care_system_diary'),
    logs: localStorage.getItem('care_system_logs'),
    settings: localStorage.getItem('care_system_settings'),
    exportedAt: new Date().toISOString(),
  };
  return JSON.stringify(data, null, 2);
}

/**
 * Import data from backup
 */
export function importData(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString);
    
    if (data.pets) localStorage.setItem('care_system_pets', data.pets);
    if (data.plants) localStorage.setItem('care_system_plants', data.plants);
    if (data.schedules) localStorage.setItem('care_system_schedules', data.schedules);
    if (data.diary) localStorage.setItem('care_system_diary', data.diary);
    if (data.logs) localStorage.setItem('care_system_logs', data.logs);
    if (data.settings) localStorage.setItem('care_system_settings', data.settings);
    
    // Track sync for imported data
    trackChange('setting', 'all', 'update', { imported: true, importedAt: new Date().toISOString() });
    
    return true;
  } catch (error) {
    console.error('Failed to import data:', error);
    return false;
  }
}
