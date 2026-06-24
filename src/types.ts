export type EntityType = 'pet' | 'plant';

export type CareStatus = 'Healthy' | 'Needs Attention' | 'Critical';

export interface Pet {
  id: string;
  name: string;
  type: string; // 'Dog' | 'Cat' | 'Bird' | 'Rabbit' | 'Fish' | 'Other'
  breed: string;
  age: string; // e.g. "2 years", "5 months"
  birthDate?: string; // ISO date string for age calculation
  avatarColor: string; // tailwind gradient or solid class
  avatarEmoji: string;
  healthScore?: number; // 0 - 100 status score
  maintenance?: 'low' | 'high';
  assignedTo?: string; // caregiver name
  locationArea?: string; // e.g., 'Indoor', 'Balcony', 'Garden', 'Outdoor'
  photoTimeline?: { id: string; date: string; photoUrl: string; label: string; notes?: string }[];
  streakCount?: number;
  expenses?: { id: string; category: 'food' | 'vet' | 'supplies' | 'other'; amount: number; date: string; notes: string }[];
}

export interface Plant {
  id: string;
  name: string;
  species: string;
  location: string; // Keep for backwards-compatibility
  sunlight: 'Low' | 'Medium' | 'High';
  avatarColor: string;
  avatarEmoji: string;
  birthDate?: string; // ISO date string for age calculation
  status: CareStatus; // Healthy, Needs Attention, Critical
  healthScore?: number; // 0 - 100 status score
  maintenance?: 'low' | 'high';
  assignedTo?: string; // caregiver name
  locationArea?: string; // e.g., 'Indoor', 'Balcony', 'Garden', 'Outdoor'
  photoTimeline?: { id: string; date: string; photoUrl: string; label: string; notes?: string }[];
  streakCount?: number;
}

export type PetTaskType = 'feeding' | 'walking' | 'vet' | 'medicine' | 'other';
export type PlantTaskType = 'watering' | 'fertilizer' | 'sunlight' | 'other';
export type UnifiedTaskType = PetTaskType | PlantTaskType;

export type TaskStatus = 'pending' | 'in_progress' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Schedule {
  id: string;
  entityId: string;
  entityType: EntityType;
  entityName: string;
  taskType: UnifiedTaskType;
  name: string;
  intervalDays: number;
  lastCompleted: string | null;
  nextDue: string;
  assignedTo?: string;
  reminderTime?: string; // HH:MM format
  priority?: TaskPriority;
  status: TaskStatus;
  isArchived: boolean;
  archivedAt?: string;
  completedAt?: string;
}

export type NoteCategory = 'health' | 'growth' | 'behavior' | 'observation' | 'general' | 'mood';

export interface DiaryEntry {
  id: string;
  entityId: string; // refers to Pet or Plant ID
  entityType: EntityType;
  entityName: string;
  timestamp: string; // ISO DateTime
  text: string;
  category: NoteCategory;
  tags: string[];
  mood?: string; // e.g. "Happy", "Energetic", "Tired", "Anxious" for pets, or growth scale
  photoUrl?: string; // Optional Base64/url for growth tracker before/after
}

export interface CareLog {
  id: string;
  entityId: string;
  entityType: EntityType;
  entityName: string;
  taskType: UnifiedTaskType;
  taskName: string;
  timestamp: string; // ISO DateTime
  notes?: string;
  assignedTo?: string; // logged caregiver
}
