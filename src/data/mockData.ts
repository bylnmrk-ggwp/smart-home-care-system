import { Pet, Plant, Schedule, DiaryEntry, CareLog } from '../types';

// Helper to generate ISO strings relative to now
export const getRelativeDateString = (daysOffset: number, hoursOffset: number = 0): string => {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  d.setHours(d.getHours() + hoursOffset);
  return d.toISOString();
};

// Calculate age string from birth date
export const calculateAgeFromBirthDate = (birthDate?: string): string => {
  if (!birthDate) return '';
  const birth = new Date(birthDate);
  const now = new Date();
  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();
  if (months < 0) { years--; months += 12; }
  if (years > 0) return `${years} year${years > 1 ? 's' : ''}${months > 0 ? `, ${months} month${months > 1 ? 's' : ''}` : ''}`;
  if (months > 0) return `${months} month${months > 1 ? 's' : ''}`;
  const days = Math.floor((now.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24));
  return `${days} day${days !== 1 ? 's' : ''}`;
};

export const INITIAL_PETS: Pet[] = [
  {
    id: 'pet-1',
    name: 'Max',
    type: 'Dog',
    breed: 'Golden Retriever',
    age: '2 years',
    birthDate: new Date(Date.now() - 2 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    avatarColor: 'from-amber-400 to-orange-500',
    avatarEmoji: '🐕',
  },
  {
    id: 'pet-2',
    name: 'Luna',
    type: 'Cat',
    breed: 'Siamese',
    age: '1 year',
    birthDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    avatarColor: 'from-indigo-400 to-purple-500',
    avatarEmoji: '🐈',
  },
];

export const INITIAL_PLANTS: Plant[] = [
  {
    id: 'plant-1',
    name: 'Monstera Deliciosa',
    species: 'Monstera',
    location: 'Indoor (Living Room)',
    sunlight: 'Medium',
    avatarColor: 'from-emerald-400 to-teal-600',
    avatarEmoji: '🌿',
    status: 'Healthy',
    birthDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  },
  {
    id: 'plant-2',
    name: 'Golden Pothos',
    species: 'Epipremnum aureum',
    location: 'Indoor (Kitchen)',
    sunlight: 'Low',
    avatarColor: 'from-green-400 to-emerald-500',
    avatarEmoji: '🌱',
    status: 'Needs Attention',
    birthDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  },
  {
    id: 'plant-3',
    name: 'Outdoor Lavender',
    species: 'Lavandula',
    location: 'Outdoor (Patio)',
    sunlight: 'High',
    avatarColor: 'from-purple-400 to-indigo-500',
    avatarEmoji: '🪻',
    status: 'Healthy',
    birthDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  },
];

export const INITIAL_SCHEDULES: Schedule[] = [
  // Max Tasks
  {
    id: 'sched-1',
    entityId: 'pet-1',
    entityType: 'pet',
    entityName: 'Max',
    taskType: 'feeding',
    name: 'Morning Feeding',
    intervalDays: 1,
    lastCompleted: getRelativeDateString(-1, 2),
    nextDue: getRelativeDateString(0, -2),
    status: 'pending',
    isArchived: false,
    priority: 'high',
    reminderTime: '08:00',
  },
  {
    id: 'sched-2',
    entityId: 'pet-1',
    entityType: 'pet',
    entityName: 'Max',
    taskType: 'walking',
    name: 'Evening Walk',
    intervalDays: 1,
    lastCompleted: getRelativeDateString(-1, 10),
    nextDue: getRelativeDateString(0, 4),
    status: 'pending',
    isArchived: false,
    priority: 'medium',
    reminderTime: '17:00',
  },
  {
    id: 'sched-3',
    entityId: 'pet-1',
    entityType: 'pet',
    entityName: 'Max',
    taskType: 'medicine',
    name: 'Heartworm Chewable',
    intervalDays: 30,
    lastCompleted: getRelativeDateString(-15),
    nextDue: getRelativeDateString(15),
    status: 'pending',
    isArchived: false,
    priority: 'high',
  },
  // Luna Tasks
  {
    id: 'sched-4',
    entityId: 'pet-2',
    entityType: 'pet',
    entityName: 'Luna',
    taskType: 'feeding',
    name: 'Wet Food dinner',
    intervalDays: 1,
    lastCompleted: getRelativeDateString(-1, 8),
    nextDue: getRelativeDateString(0, 1),
    status: 'pending',
    isArchived: false,
    priority: 'medium',
    reminderTime: '18:00',
  },
  {
    id: 'sched-5',
    entityId: 'pet-2',
    entityType: 'pet',
    entityName: 'Luna',
    taskType: 'vet',
    name: 'Annual Vaccination Check',
    intervalDays: 365,
    lastCompleted: getRelativeDateString(-350),
    nextDue: getRelativeDateString(15),
    status: 'pending',
    isArchived: false,
    priority: 'high',
  },
  // Monstera Tasks
  {
    id: 'sched-6',
    entityId: 'plant-1',
    entityType: 'plant',
    entityName: 'Monstera Deliciosa',
    taskType: 'watering',
    name: 'Soil watering & misting',
    intervalDays: 7,
    lastCompleted: getRelativeDateString(-7, 1),
    nextDue: getRelativeDateString(0, -1),
    status: 'pending',
    isArchived: false,
    priority: 'high',
    reminderTime: '09:00',
  },
  {
    id: 'sched-7',
    entityId: 'plant-1',
    entityType: 'plant',
    entityName: 'Monstera Deliciosa',
    taskType: 'fertilizer',
    name: 'Organic Liquid Feed',
    intervalDays: 30,
    lastCompleted: getRelativeDateString(-25),
    nextDue: getRelativeDateString(5),
    status: 'pending',
    isArchived: false,
    priority: 'low',
  },
  // Pothos Tasks
  {
    id: 'sched-8',
    entityId: 'plant-2',
    entityType: 'plant',
    entityName: 'Golden Pothos',
    taskType: 'watering',
    name: 'Weekly soak',
    intervalDays: 7,
    lastCompleted: getRelativeDateString(-9),
    nextDue: getRelativeDateString(-2),
    status: 'pending',
    isArchived: false,
    priority: 'medium',
    reminderTime: '10:00',
  },
  // Lavender Tasks
  {
    id: 'sched-9',
    entityId: 'plant-3',
    entityType: 'plant',
    entityName: 'Outdoor Lavender',
    taskType: 'watering',
    name: 'Morning watering',
    intervalDays: 3,
    lastCompleted: getRelativeDateString(-1),
    nextDue: getRelativeDateString(2),
    status: 'in_progress',
    isArchived: false,
    priority: 'medium',
    reminderTime: '06:00',
  },
];

export const INITIAL_DIARY: DiaryEntry[] = [
  {
    id: 'diary-1',
    entityId: 'pet-1',
    entityType: 'pet',
    entityName: 'Max',
    timestamp: getRelativeDateString(-1, -4),
    text: 'Ate all his kibble with great appetite! He was super active during our park run, chasing three balls in a row without getting tired.',
    category: 'behavior',
    tags: ['behavior', 'energy', 'eating'],
    mood: 'Energetic',
  },
  {
    id: 'diary-2',
    entityId: 'pet-2',
    entityType: 'pet',
    entityName: 'Luna',
    timestamp: getRelativeDateString(-3, 0),
    text: 'Luna sneezed twice this morning. Kept a close eye on her. By afternoon she seemed totally fine, napping in her usual sunny spot on the couch.',
    category: 'health',
    tags: ['health', 'sneezing', 'observation'],
    mood: 'Calm',
  },
  {
    id: 'diary-3',
    entityId: 'plant-1',
    entityType: 'plant',
    entityName: 'Monstera Deliciosa',
    timestamp: getRelativeDateString(-5, 0),
    text: 'A brand new glossy leaf has started unfolding from the main stalk! It looks pristine and bright green. The light in the living room corner seems perfect.',
    category: 'growth',
    tags: ['growth', 'new-leaf', 'indoor'],
  },
  {
    id: 'diary-4',
    entityId: 'plant-2',
    entityType: 'plant',
    entityName: 'Golden Pothos',
    timestamp: getRelativeDateString(-2, 0),
    text: 'Noticed some yellowing leaves near the top vine. The soil still feels damp, which might mean the roots are staying too wet. Moving it slightly closer to the kitchen window and skipping next watering.',
    category: 'health',
    tags: ['health', 'yellow-leaves', 'sunlight'],
  },
];

export const INITIAL_LOGS: CareLog[] = [
  {
    id: 'log-1',
    entityId: 'pet-1',
    entityType: 'pet',
    entityName: 'Max',
    taskType: 'feeding',
    taskName: 'Morning Feeding',
    timestamp: getRelativeDateString(-1, 2),
    notes: 'Ate very fast. Added a spoonful of pumpkin puree.',
  },
  {
    id: 'log-2',
    entityId: 'pet-1',
    entityType: 'pet',
    entityName: 'Max',
    taskType: 'walking',
    taskName: 'Evening Walk',
    timestamp: getRelativeDateString(-1, 10),
    notes: 'Walked for 45 minutes around the lake. Met other dogs.',
  },
  {
    id: 'log-3',
    entityId: 'plant-1',
    entityType: 'plant',
    entityName: 'Monstera Deliciosa',
    taskType: 'watering',
    timestamp: getRelativeDateString(-7, 1),
    taskName: 'Soil watering & misting',
    notes: 'Misted leaves and added slow-release fertilizer pellet.',
  },
];
