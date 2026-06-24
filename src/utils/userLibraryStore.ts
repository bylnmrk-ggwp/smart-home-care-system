const STORAGE_KEY = 'care_system_user_library';

export interface UserLibraryItem {
  id: string;
  type: 'plant' | 'pet';
  name: string;
  category: string;
  description: string;
  careInstructions: string;
  benefits: string;
  indoorOutdoor: 'indoor' | 'outdoor' | 'both';
  image: string;
  scientificName: string;
  createdAt: string;
  updatedAt: string;
  importedFrom?: string;
}

function generateId(): string {
  return 'usr_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
}

function readAll(): UserLibraryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

function writeAll(items: UserLibraryItem[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function getAllUserItems(): UserLibraryItem[] {
  return readAll();
}

export function getUserItemById(id: string): UserLibraryItem | undefined {
  return readAll().find((i) => i.id === id);
}

export function addUserItem(
  data: Omit<UserLibraryItem, 'id' | 'createdAt' | 'updatedAt'>
): UserLibraryItem {
  const items = readAll();
  const now = new Date().toISOString();
  const item: UserLibraryItem = {
    ...data,
    id: generateId(),
    createdAt: now,
    updatedAt: now,
  };
  items.push(item);
  writeAll(items);
  return item;
}

export function updateUserItem(
  id: string,
  data: Partial<Omit<UserLibraryItem, 'id' | 'createdAt'>>
): UserLibraryItem | null {
  const items = readAll();
  const idx = items.findIndex((i) => i.id === id);
  if (idx === -1) return null;
  items[idx] = {
    ...items[idx],
    ...data,
    updatedAt: new Date().toISOString(),
  };
  writeAll(items);
  return items[idx];
}

export function deleteUserItem(id: string): boolean {
  const items = readAll();
  const filtered = items.filter((i) => i.id !== id);
  if (filtered.length === items.length) return false;
  writeAll(filtered);
  return true;
}

export function searchUserItems(query: string): UserLibraryItem[] {
  const items = readAll();
  if (!query.trim()) return items;
  const q = query.toLowerCase();
  return items.filter(
    (i) =>
      i.name.toLowerCase().includes(q) ||
      i.category.toLowerCase().includes(q) ||
      i.description.toLowerCase().includes(q) ||
      i.scientificName.toLowerCase().includes(q) ||
      i.careInstructions.toLowerCase().includes(q) ||
      i.benefits.toLowerCase().includes(q)
  );
}

export function filterUserItems(type?: 'plant' | 'pet'): UserLibraryItem[] {
  const items = readAll();
  if (!type) return items;
  return items.filter((i) => i.type === type);
}
