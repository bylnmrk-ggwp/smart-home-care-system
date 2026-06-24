/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { getDatabase } from './database';
import { Pet, Plant, Schedule, DiaryEntry, CareLog } from '../types';

/**
 * Database Service Layer
 * Handles all CRUD operations for the smart home care system using IndexedDB
 */

// ==================== PET OPERATIONS ====================

export async function getAllPets(): Promise<Pet[]> {
  const db = await getDatabase();
  return await db.getAll('pets');
}

export async function getPetById(id: string): Promise<Pet | undefined> {
  const db = await getDatabase();
  return await db.get('pets', id);
}

export async function insertPet(pet: Pet): Promise<void> {
  const db = await getDatabase();
  await db.put('pets', pet);
}

export async function updatePet(pet: Pet): Promise<void> {
  const db = await getDatabase();
  await db.put('pets', pet);
}

export async function deletePet(id: string): Promise<void> {
  const db = await getDatabase();
  await db.delete('pets', id);
}

// ==================== PLANT OPERATIONS ====================

export async function getAllPlants(): Promise<Plant[]> {
  const db = await getDatabase();
  return await db.getAll('plants');
}

export async function getPlantById(id: string): Promise<Plant | undefined> {
  const db = await getDatabase();
  return await db.get('plants', id);
}

export async function insertPlant(plant: Plant): Promise<void> {
  const db = await getDatabase();
  await db.put('plants', plant);
}

export async function updatePlant(plant: Plant): Promise<void> {
  const db = await getDatabase();
  await db.put('plants', plant);
}

export async function deletePlant(id: string): Promise<void> {
  const db = await getDatabase();
  await db.delete('plants', id);
}

// ==================== SCHEDULE OPERATIONS ====================

export async function getAllSchedules(): Promise<Schedule[]> {
  const db = await getDatabase();
  return await db.getAll('schedules');
}

export async function insertSchedule(schedule: Schedule): Promise<void> {
  const db = await getDatabase();
  await db.put('schedules', schedule);
}

export async function updateSchedule(schedule: Schedule): Promise<void> {
  const db = await getDatabase();
  await db.put('schedules', schedule);
}

export async function deleteSchedule(id: string): Promise<void> {
  const db = await getDatabase();
  await db.delete('schedules', id);
}

// ==================== DIARY ENTRY OPERATIONS ====================

export async function getAllDiaryEntries(): Promise<DiaryEntry[]> {
  const db = await getDatabase();
  return await db.getAll('diary_entries');
}

export async function insertDiaryEntry(entry: DiaryEntry): Promise<void> {
  const db = await getDatabase();
  await db.put('diary_entries', entry);
}

export async function deleteDiaryEntry(id: string): Promise<void> {
  const db = await getDatabase();
  await db.delete('diary_entries', id);
}

// ==================== CARE LOG OPERATIONS ====================

export async function getAllCareLogs(): Promise<CareLog[]> {
  const db = await getDatabase();
  return await db.getAll('care_logs');
}

export async function insertCareLog(log: CareLog): Promise<void> {
  const db = await getDatabase();
  await db.put('care_logs', log);
}

export async function deleteCareLog(id: string): Promise<void> {
  const db = await getDatabase();
  await db.delete('care_logs', id);
}

// ==================== SETTINGS OPERATIONS ====================

export async function getSetting(key: string): Promise<string | null> {
  const db = await getDatabase();
  const result = await db.get('settings', key);
  return result?.value || null;
}

export async function setSetting(key: string, value: string): Promise<void> {
  const db = await getDatabase();
  await db.put('settings', { key, value, updated_at: new Date().toISOString() });
}

export async function getAllSettings(): Promise<Record<string, string>> {
  const db = await getDatabase();
  const all = await db.getAll('settings');
  const settings: Record<string, string> = {};
  all.forEach(item => {
    settings[item.key] = item.value;
  });
  return settings;
}

// ==================== SYNC OPERATIONS ====================

export interface SyncRecord {
  id: number;
  entityType: string;
  entityId: string;
  action: 'create' | 'update' | 'delete';
  data: string;
  synced: boolean;
  created_at: string;
}

export async function addSyncRecord(entityType: string, entityId: string, action: 'create' | 'update' | 'delete', data: any): Promise<void> {
  const db = await getDatabase();
  await db.add('sync_status', {
    entityType,
    entityId,
    action,
    data: JSON.stringify(data),
    synced: false,
    created_at: new Date().toISOString(),
  });
}

export async function getPendingSyncRecords(): Promise<SyncRecord[]> {
  const db = await getDatabase();
  const all = await db.getAll('sync_status');
  return all
    .filter(record => !record.synced)
    .map(record => ({
      id: (record as any).id as number,
      entityType: record.entityType,
      entityId: record.entityId,
      action: record.action,
      data: record.data,
      synced: record.synced,
      created_at: record.created_at,
    }));
}

export async function markSyncRecordAsSynced(id: number): Promise<void> {
  const db = await getDatabase();
  const record = await db.get('sync_status', id);
  if (record) {
    await db.put('sync_status', { ...record, synced: true });
  }
}

export async function clearSyncedRecords(): Promise<void> {
  const db = await getDatabase();
  const all = await db.getAll('sync_status');
  for (const record of all) {
    if (record.synced) {
      await db.delete('sync_status', (record as any).id);
    }
  }
}
