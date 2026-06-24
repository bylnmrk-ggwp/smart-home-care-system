import { useState, useEffect } from 'react';
import { Pet, Plant, Schedule, DiaryEntry, CareLog, UnifiedTaskType, EntityType, CareStatus, TaskStatus } from '../types';
import {
  INITIAL_PETS,
  INITIAL_PLANTS,
  INITIAL_SCHEDULES,
  INITIAL_DIARY,
  INITIAL_LOGS,
  getRelativeDateString
} from '../data/mockData';
import {
  getAllPets,
  getPetById,
  insertPet,
  updatePet as dbUpdatePet,
  deletePet as dbDeletePet,
  getAllPlants,
  getPlantById,
  insertPlant,
  updatePlant as dbUpdatePlant,
  deletePlant as dbDeletePlant,
  getAllSchedules,
  insertSchedule,
  updateSchedule as dbUpdateSchedule,
  deleteSchedule as dbDeleteSchedule,
  getAllDiaryEntries,
  insertDiaryEntry,
  deleteDiaryEntry as dbDeleteDiaryEntry,
  getAllCareLogs,
  insertCareLog,
  deleteCareLog as dbDeleteCareLog,
  getSetting,
  setSetting,
  addSyncRecord,
  getPendingSyncRecords,
  markSyncRecordAsSynced,
  clearSyncedRecords
} from '../utils/dbService';
import { initializeDatabase, hasInitialData, resetDatabase } from '../utils/database';
import { trackChange, startAutoSync, stopAutoSync, getSyncStatus } from '../utils/syncService';

export function useCareSystem() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [diary, setDiary] = useState<DiaryEntry[]>([]);
  const [logs, setLogs] = useState<CareLog[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(localStorage.getItem('care_system_last_sync'));

  // Online/offline detection
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncData();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Start auto-sync
    startAutoSync();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      stopAutoSync();
    };
  }, []);

  // Sync function - syncs pending records when online
  const syncData = async () => {
    try {
      const pendingRecords = getPendingSyncRecords();
      
      if (pendingRecords.length > 0) {
        console.log(`Syncing ${pendingRecords.length} pending records...`);
        
        // In a real implementation, this would send data to a backend API
        // For now, we just mark them as synced
        pendingRecords.forEach(record => {
          markSyncRecordAsSynced(record.id);
        });
        
        // Clear synced records
        clearSyncedRecords();
      }
      
      const now = new Date().toISOString();
      localStorage.setItem('care_system_last_sync', now);
      setLastSyncTime(now);
      console.log('Data synced at', now);
    } catch (error) {
      console.error('Sync failed:', error);
    }
  };

  // Initialize from database or mock data
  useEffect(() => {
    const loadData = async () => {
      try {
        // Initialize database
        await initializeDatabase();

        // Check if database has initial data
        const hasData = await hasInitialData();

        if (hasData) {
          // Load from database
          setPets(await getAllPets());
          setPlants(await getAllPlants());
          setSchedules(await getAllSchedules());
          setDiary(await getAllDiaryEntries());
          setLogs(await getAllCareLogs());
        } else {
          // Seed database with initial mock data
          for (const pet of INITIAL_PETS) await insertPet(pet);
          for (const plant of INITIAL_PLANTS) await insertPlant(plant);
          for (const schedule of INITIAL_SCHEDULES) await insertSchedule(schedule);
          for (const entry of INITIAL_DIARY) await insertDiaryEntry(entry);
          for (const log of INITIAL_LOGS) await insertCareLog(log);

          // Set state from seeded data
          setPets(INITIAL_PETS);
          setPlants(INITIAL_PLANTS);
          setSchedules(INITIAL_SCHEDULES);
          setDiary(INITIAL_DIARY);
          setLogs(INITIAL_LOGS);
        }

        // Sync on initial load if online
        if (navigator.onLine) {
          syncData();
        }
      } catch (error) {
        console.error('Failed to initialize database:', error);
        // Fallback to localStorage if database fails
        const localPets = localStorage.getItem('care_system_pets');
        const localPlants = localStorage.getItem('care_system_plants');
        const localSchedules = localStorage.getItem('care_system_schedules');
        const localDiary = localStorage.getItem('care_system_diary');
        const localLogs = localStorage.getItem('care_system_logs');

        if (localPets) setPets(JSON.parse(localPets));
        else setPets(INITIAL_PETS);

        if (localPlants) setPlants(JSON.parse(localPlants));
        else setPlants(INITIAL_PLANTS);

        if (localSchedules) setSchedules(JSON.parse(localSchedules));
        else setSchedules(INITIAL_SCHEDULES);

        if (localDiary) setDiary(JSON.parse(localDiary));
        else setDiary(INITIAL_DIARY);

        if (localLogs) setLogs(JSON.parse(localLogs));
        else setLogs(INITIAL_LOGS);
      }
    };

    loadData();
  }, []);

  // Save to database whenever state changes
  const savePets = async (newPets: Pet[]) => {
    setPets(newPets);
    // Sync with database - find new/updated pets and save them
    for (const pet of newPets) {
      const existing = await getPetById(pet.id);
      if (existing) {
        await dbUpdatePet(pet);
      } else {
        await insertPet(pet);
      }
    }
    // Remove deleted pets from database
    const currentDbPets = await getAllPets();
    for (const dbPet of currentDbPets) {
      if (!newPets.find(p => p.id === dbPet.id)) {
        await dbDeletePet(dbPet.id);
      }
    }
    if (isOnline) syncData();
  };

  const savePlants = async (newPlants: Plant[]) => {
    setPlants(newPlants);
    // Sync with database
    for (const plant of newPlants) {
      const existing = await getPlantById(plant.id);
      if (existing) {
        await dbUpdatePlant(plant);
      } else {
        await insertPlant(plant);
      }
    }
    // Remove deleted plants from database
    const currentDbPlants = await getAllPlants();
    for (const dbPlant of currentDbPlants) {
      if (!newPlants.find(p => p.id === dbPlant.id)) {
        await dbDeletePlant(dbPlant.id);
      }
    }
    if (isOnline) syncData();
  };

  const saveSchedules = async (newSchedules: Schedule[]) => {
    setSchedules(newSchedules);
    // Sync with database
    const currentDbSchedules = await getAllSchedules();
    for (const schedule of newSchedules) {
      const existing = currentDbSchedules.find(s => s.id === schedule.id);
      if (existing) {
        await dbUpdateSchedule(schedule);
      } else {
        await insertSchedule(schedule);
      }
    }
    // Remove deleted schedules from database
    for (const dbSchedule of currentDbSchedules) {
      if (!newSchedules.find(s => s.id === dbSchedule.id)) {
        await dbDeleteSchedule(dbSchedule.id);
      }
    }
    if (isOnline) syncData();
  };

  const saveDiary = async (newDiary: DiaryEntry[]) => {
    setDiary(newDiary);
    // Sync with database
    const currentDbDiary = await getAllDiaryEntries();
    for (const entry of newDiary) {
      const existing = currentDbDiary.find(d => d.id === entry.id);
      if (!existing) {
        await insertDiaryEntry(entry);
      }
    }
    // Remove deleted entries from database
    for (const dbEntry of currentDbDiary) {
      if (!newDiary.find(d => d.id === dbEntry.id)) {
        await dbDeleteDiaryEntry(dbEntry.id);
      }
    }
    if (isOnline) syncData();
  };

  const saveLogs = async (newLogs: CareLog[]) => {
    setLogs(newLogs);
    // Sync with database
    const currentDbLogs = await getAllCareLogs();
    for (const log of newLogs) {
      const existing = currentDbLogs.find(l => l.id === log.id);
      if (!existing) {
        await insertCareLog(log);
      }
    }
    // Remove deleted logs from database
    for (const dbLog of currentDbLogs) {
      if (!newLogs.find(l => l.id === dbLog.id)) {
        await dbDeleteCareLog(dbLog.id);
      }
    }
    if (isOnline) syncData();
  };

  // --- PETS CRUD ---
  const addPet = (petData: Omit<Pet, 'id'>) => {
    const newPet: Pet = {
      ...petData,
      id: `pet-${Date.now()}`,
    };
    const updated = [...pets, newPet];
    savePets(updated);

    // Create default schedules for new pet (e.g. daily feeding, daily walking)
    const newSchedules: Schedule[] = [
      {
        id: `sched-${Date.now()}-1`,
        entityId: newPet.id,
        entityType: 'pet',
        entityName: newPet.name,
        taskType: 'feeding',
        name: 'Feeding schedule',
        intervalDays: 1,
        lastCompleted: null,
        nextDue: getRelativeDateString(0, 2),
        status: 'pending',
        isArchived: false,
      },
      {
        id: `sched-${Date.now()}-2`,
        entityId: newPet.id,
        entityType: 'pet',
        entityName: newPet.name,
        taskType: 'walking',
        name: 'Walk schedule',
        intervalDays: 1,
        lastCompleted: null,
        nextDue: getRelativeDateString(0, 4),
        status: 'pending',
        isArchived: false,
      }
    ];
    saveSchedules([...schedules, ...newSchedules]);

    // Create automatic diary entry log
    const entry: DiaryEntry = {
      id: `diary-${Date.now()}`,
      entityId: newPet.id,
      entityType: 'pet',
      entityName: newPet.name,
      timestamp: new Date().toISOString(),
      text: `Added ${newPet.name} (${newPet.breed || newPet.type}) to the care system!`,
      category: 'general',
      tags: ['added', 'profile'],
    };
    saveDiary([entry, ...diary]);

    return newPet;
  };

  const updatePet = (updatedPet: Pet) => {
    const updated = pets.map(p => p.id === updatedPet.id ? updatedPet : p);
    savePets(updated);

    // Sync schedules entityName just in case it changed
    const updatedSchedules = schedules.map(s => 
      s.entityId === updatedPet.id ? { ...s, entityName: updatedPet.name } : s
    );
    saveSchedules(updatedSchedules);

    // Sync diary entityName
    const updatedDiary = diary.map(d => 
      d.entityId === updatedPet.id ? { ...d, entityName: updatedPet.name } : d
    );
    saveDiary(updatedDiary);

    // Sync logs entityName
    const updatedLogs = logs.map(l => 
      l.entityId === updatedPet.id ? { ...l, entityName: updatedPet.name } : l
    );
    saveLogs(updatedLogs);
  };

  const deletePet = (id: string) => {
    const updated = pets.filter(p => p.id !== id);
    savePets(updated);

    // Remove related schedules, logs, diary
    saveSchedules(schedules.filter(s => s.entityId !== id));
    saveDiary(diary.filter(d => d.entityId !== id));
    saveLogs(logs.filter(l => l.entityId !== id));
  };

  // --- PLANTS CRUD ---
  const addPlant = (plantData: Omit<Plant, 'id'>) => {
    const newPlant: Plant = {
      ...plantData,
      id: `plant-${Date.now()}`,
    };
    const updated = [...plants, newPlant];
    savePlants(updated);

    // Create standard default schedule: watering
    const newSchedules: Schedule[] = [
      {
        id: `sched-${Date.now()}-water`,
        entityId: newPlant.id,
        entityType: 'plant',
        entityName: newPlant.name,
        taskType: 'watering',
        name: 'Regular watering',
        intervalDays: 7,
        lastCompleted: null,
        nextDue: getRelativeDateString(0, 1),
        status: 'pending',
        isArchived: false,
      }
    ];
    saveSchedules([...schedules, ...newSchedules]);

    // Add initial diary log
    const entry: DiaryEntry = {
      id: `diary-${Date.now()}`,
      entityId: newPlant.id,
      entityType: 'plant',
      entityName: newPlant.name,
      timestamp: new Date().toISOString(),
      text: `Added ${newPlant.name} (${newPlant.species}) in location "${newPlant.location}" to the care system!`,
      category: 'general',
      tags: ['added', 'profile'],
    };
    saveDiary([entry, ...diary]);

    return newPlant;
  };

  const updatePlant = (updatedPlant: Plant) => {
    const updated = plants.map(p => p.id === updatedPlant.id ? updatedPlant : p);
    savePlants(updated);

    // Sync names across other tables
    const updatedSchedules = schedules.map(s => 
      s.entityId === updatedPlant.id ? { ...s, entityName: updatedPlant.name } : s
    );
    saveSchedules(updatedSchedules);

    const updatedDiary = diary.map(d => 
      d.entityId === updatedPlant.id ? { ...d, entityName: updatedPlant.name } : d
    );
    saveDiary(updatedDiary);

    const updatedLogs = logs.map(l => 
      l.entityId === updatedPlant.id ? { ...l, entityName: updatedPlant.name } : l
    );
    saveLogs(updatedLogs);
  };

  const deletePlant = (id: string) => {
    const updated = plants.filter(p => p.id !== id);
    savePlants(updated);

    // Remove related schedules, logs, diary
    saveSchedules(schedules.filter(s => s.entityId !== id));
    saveDiary(diary.filter(d => d.entityId !== id));
    saveLogs(logs.filter(l => l.entityId !== id));
  };

  // --- SCHEDULES / TASKS CRUD ---
  const addSchedule = (schedData: Omit<Schedule, 'id'>) => {
    const newSched: Schedule = {
      ...schedData,
      id: `sched-${Date.now()}`,
    };
    const updated = [...schedules, newSched];
    saveSchedules(updated);
    return newSched;
  };

  const updateSchedule = (updatedSched: Schedule) => {
    const updated = schedules.map(s => s.id === updatedSched.id ? updatedSched : s);
    saveSchedules(updated);
  };

  const deleteSchedule = (id: string) => {
    const updated = schedules.filter(s => s.id !== id);
    saveSchedules(updated);
  };

  const archiveTask = (scheduleId: string) => {
    const sched = schedules.find(s => s.id === scheduleId);
    if (!sched) return;
    const updated: Schedule = {
      ...sched,
      status: 'completed',
      isArchived: true,
      archivedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    };
    saveSchedules(schedules.map(s => s.id === scheduleId ? updated : s));
  };

  const restoreTask = (scheduleId: string) => {
    const sched = schedules.find(s => s.id === scheduleId);
    if (!sched) return;
    const updated: Schedule = {
      ...sched,
      isArchived: false,
      archivedAt: undefined,
    };
    saveSchedules(schedules.map(s => s.id === scheduleId ? updated : s));
  };

  const updateTaskStatus = (scheduleId: string, status: TaskStatus) => {
    const sched = schedules.find(s => s.id === scheduleId);
    if (!sched) return;
    const updated: Schedule = {
      ...sched,
      status,
      completedAt: status === 'completed' ? new Date().toISOString() : sched.completedAt,
    };
    saveSchedules(schedules.map(s => s.id === scheduleId ? updated : s));
  };

  const activeSchedules = schedules.filter(s => !s.isArchived);
  const archivedSchedules = schedules.filter(s => s.isArchived);

  const completeTask = (scheduleId: string, notes?: string) => {
    const nowStr = new Date().toISOString();
    const sched = schedules.find(s => s.id === scheduleId);
    if (!sched) return;

    // 1. Calculate next due date based on intervalDays
    const nextDue = getRelativeDateString(sched.intervalDays);

    // 2. Update schedule - mark completed and archive
    const updatedSched: Schedule = {
      ...sched,
      lastCompleted: nowStr,
      nextDue,
      status: 'completed',
      isArchived: true,
      completedAt: nowStr,
      archivedAt: nowStr,
    };
    saveSchedules(schedules.map(s => s.id === scheduleId ? updatedSched : s));

    // 3. Create a CareLog entry
    const newLog: CareLog = {
      id: `log-${Date.now()}`,
      entityId: sched.entityId,
      entityType: sched.entityType,
      entityName: sched.entityName,
      taskType: sched.taskType,
      taskName: sched.name,
      timestamp: nowStr,
      notes,
    };
    saveLogs([newLog, ...logs]);

    // 4. Update parent status, health score, and habit streaks
    if (sched.entityType === 'plant') {
      const plant = plants.find(p => p.id === sched.entityId);
      if (plant) {
        const currentScore = plant.healthScore !== undefined ? plant.healthScore : (plant.status === 'Healthy' ? 90 : plant.status === 'Needs Attention' ? 65 : 35);
        const newScore = Math.min(100, currentScore + 10);
        let newStatus: CareStatus = 'Healthy';
        if (newScore < 50) newStatus = 'Critical';
        else if (newScore < 80) newStatus = 'Needs Attention';

        updatePlant({
          ...plant,
          healthScore: newScore,
          status: newStatus,
          streakCount: (plant.streakCount || 0) + 1,
        });
      }
    } else {
      const pet = pets.find(p => p.id === sched.entityId);
      if (pet) {
        const currentScore = pet.healthScore !== undefined ? pet.healthScore : 90;
        const newScore = Math.min(100, currentScore + 10);
        updatePet({
          ...pet,
          healthScore: newScore,
          streakCount: (pet.streakCount || 0) + 1,
        });
      }
    }

    // Play offline success chime if enabled in settings
    try {
      const savedSettingsStr = localStorage.getItem('care_system_settings');
      if (savedSettingsStr) {
        const settings = JSON.parse(savedSettingsStr);
        if (settings.soundEnabled && settings.successSoundEnabled) {
          const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          const vol = (settings.volume !== undefined ? settings.volume : 80) / 100;
          gain.gain.setValueAtTime(vol * 0.15, ctx.currentTime);

          osc.frequency.setValueAtTime(523.25, ctx.currentTime);
          osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08);
          osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.16);
          osc.frequency.setValueAtTime(1046.50, ctx.currentTime + 0.24);
          osc.start();
          osc.stop(ctx.currentTime + 0.4);
        }
      }
    } catch (e) {
      console.warn('Success chime playback skipped', e);
    }

    // 5. Create diary entry if notes were written
    if (notes && notes.trim().length > 0) {
      const isPlant = sched.entityType === 'plant';
      const category = isPlant ? 'growth' : 'observation';
      const entry: DiaryEntry = {
        id: `diary-${Date.now()}-comp`,
        entityId: sched.entityId,
        entityType: sched.entityType,
        entityName: sched.entityName,
        timestamp: nowStr,
        text: `Completed task "${sched.name}": ${notes}`,
        category: category,
        tags: ['task-completion', sched.taskType],
      };
      saveDiary([entry, ...diary]);
    }
  };

  const deletePhotoFromTimeline = (entityId: string, entityType: EntityType, photoId: string) => {
    if (entityType === 'plant') {
      const plant = plants.find(p => p.id === entityId);
      if (plant) {
        const timeline = (plant.photoTimeline || []).filter(p => p.id !== photoId);
        updatePlant({ ...plant, photoTimeline: timeline });
      }
    } else {
      const pet = pets.find(p => p.id === entityId);
      if (pet) {
        const timeline = (pet.photoTimeline || []).filter(p => p.id !== photoId);
        updatePet({ ...pet, photoTimeline: timeline });
      }
    }
  };

  const updatePhotoInTimeline = (entityId: string, entityType: EntityType, photoId: string, updates: { label?: string; notes?: string }) => {
    if (entityType === 'plant') {
      const plant = plants.find(p => p.id === entityId);
      if (plant) {
        const timeline = (plant.photoTimeline || []).map(p =>
          p.id === photoId ? { ...p, ...updates } : p
        );
        updatePlant({ ...plant, photoTimeline: timeline });
      }
    } else {
      const pet = pets.find(p => p.id === entityId);
      if (pet) {
        const timeline = (pet.photoTimeline || []).map(p =>
          p.id === photoId ? { ...p, ...updates } : p
        );
        updatePet({ ...pet, photoTimeline: timeline });
      }
    }
  };

  const addPhotoToTimeline = (entityId: string, entityType: EntityType, photoUrl: string, label: string) => {
    const newEntry = {
      id: `photo-${Date.now()}`,
      date: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
      photoUrl,
      label,
    };

    if (entityType === 'plant') {
      const plant = plants.find(p => p.id === entityId);
      if (plant) {
        const timeline = plant.photoTimeline || [];
        updatePlant({
          ...plant,
          photoTimeline: [...timeline, newEntry],
        });
      }
    } else {
      const pet = pets.find(p => p.id === entityId);
      if (pet) {
        const timeline = pet.photoTimeline || [];
        updatePet({
          ...pet,
          photoTimeline: [...timeline, newEntry],
        });
      }
    }
  };

  // --- DIARY / NOTES CRUD ---
  const addDiaryEntry = (entryData: Omit<DiaryEntry, 'id' | 'timestamp'>) => {
    const newEntry: DiaryEntry = {
      ...entryData,
      id: `diary-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    saveDiary([newEntry, ...diary]);

    // Side effect: If a plant is marked unhealthy or recovered in a diary entry, let the user change the status explicitly, but we can also auto-adjust plant status based on category/tags if health is updated.
    return newEntry;
  };

  const updateDiaryEntry = (updatedEntry: DiaryEntry) => {
    const updated = diary.map(d => d.id === updatedEntry.id ? updatedEntry : d);
    saveDiary(updated);
  };

  const deleteDiaryEntry = (id: string) => {
    const updated = diary.filter(d => d.id !== id);
    saveDiary(updated);
  };

  // --- LOGS CRUD ---
  const deleteLog = (id: string) => {
    const updated = logs.filter(l => l.id !== id);
    saveLogs(updated);
  };

  // --- STORAGE & RESET CONTROLS ---
  const resetAllData = async () => {
    // Reset database
    await resetDatabase();
    
    // Clear localStorage
    localStorage.removeItem('care_system_pets');
    localStorage.removeItem('care_system_plants');
    localStorage.removeItem('care_system_schedules');
    localStorage.removeItem('care_system_diary');
    localStorage.removeItem('care_system_logs');
    localStorage.removeItem('care_system_settings');

    // Re-seed database with initial data
    for (const pet of INITIAL_PETS) await insertPet(pet);
    for (const plant of INITIAL_PLANTS) await insertPlant(plant);
    for (const schedule of INITIAL_SCHEDULES) await insertSchedule(schedule);
    for (const entry of INITIAL_DIARY) await insertDiaryEntry(entry);
    for (const log of INITIAL_LOGS) await insertCareLog(log);

    // Set state
    setPets(INITIAL_PETS);
    setPlants(INITIAL_PLANTS);
    setSchedules(INITIAL_SCHEDULES);
    setDiary(INITIAL_DIARY);
    setLogs(INITIAL_LOGS);
  };

  const resetPetsAndPlants = async () => {
    // Clear all data from database
    await resetDatabase();
    
    setPets([]);
    setPlants([]);
    setSchedules([]);
    setDiary([]);
    setLogs([]);

    localStorage.setItem('care_system_pets', JSON.stringify([]));
    localStorage.setItem('care_system_plants', JSON.stringify([]));
    localStorage.setItem('care_system_schedules', JSON.stringify([]));
    localStorage.setItem('care_system_diary', JSON.stringify([]));
    localStorage.setItem('care_system_logs', JSON.stringify([]));
  };

  const restoreData = (imported: any): boolean => {
    try {
      if (imported.care_system_pets) {
        const parsed = JSON.parse(imported.care_system_pets);
        setPets(parsed);
        localStorage.setItem('care_system_pets', imported.care_system_pets);
        // Update database
        parsed.forEach((pet: Pet) => {
          const existing = getPetById(pet.id);
          if (existing) {
            dbUpdatePet(pet);
          } else {
            insertPet(pet);
          }
        });
      }
      if (imported.care_system_plants) {
        const parsed = JSON.parse(imported.care_system_plants);
        setPlants(parsed);
        localStorage.setItem('care_system_plants', imported.care_system_plants);
        // Update database
        parsed.forEach((plant: Plant) => {
          const existing = getPlantById(plant.id);
          if (existing) {
            dbUpdatePlant(plant);
          } else {
            insertPlant(plant);
          }
        });
      }
      if (imported.care_system_schedules) {
        const parsed = JSON.parse(imported.care_system_schedules);
        setSchedules(parsed);
        localStorage.setItem('care_system_schedules', imported.care_system_schedules);
        // Update database
        parsed.forEach((schedule: Schedule) => {
          const existing = getAllSchedules().find(s => s.id === schedule.id);
          if (existing) {
            dbUpdateSchedule(schedule);
          } else {
            insertSchedule(schedule);
          }
        });
      }
      if (imported.care_system_diary) {
        const parsed = JSON.parse(imported.care_system_diary);
        setDiary(parsed);
        localStorage.setItem('care_system_diary', imported.care_system_diary);
        // Update database
        parsed.forEach((entry: DiaryEntry) => {
          const existing = getAllDiaryEntries().find(d => d.id === entry.id);
          if (!existing) {
            insertDiaryEntry(entry);
          }
        });
      }
      if (imported.care_system_logs) {
        const parsed = JSON.parse(imported.care_system_logs);
        setLogs(parsed);
        localStorage.setItem('care_system_logs', imported.care_system_logs);
        // Update database
        parsed.forEach((log: CareLog) => {
          const existing = getAllCareLogs().find(l => l.id === log.id);
          if (!existing) {
            insertCareLog(log);
          }
        });
      }
      if (imported.care_system_settings) {
        localStorage.setItem('care_system_settings', imported.care_system_settings);
      }
      return true;
    } catch (e) {
      console.error('Failed to restore data', e);
      return false;
    }
  };

  return {
    pets,
    plants,
    schedules,
    activeSchedules,
    archivedSchedules,
    diary,
    logs,
    isOnline,
    lastSyncTime,
    syncData,
    addPet,
    updatePet,
    deletePet,
    addPlant,
    updatePlant,
    deletePlant,
    addSchedule,
    updateSchedule,
    deleteSchedule,
    completeTask,
    archiveTask,
    restoreTask,
    updateTaskStatus,
    addDiaryEntry,
    updateDiaryEntry,
    deleteDiaryEntry,
    deleteLog,
    addPhotoToTimeline,
    deletePhotoFromTimeline,
    updatePhotoInTimeline,
    resetAllData,
    resetPetsAndPlants,
    restoreData,
  };
}
