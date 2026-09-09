import { HistoryRecord, User } from '../types';

const STORAGE_KEYS = {
  USERS: 'document_verify_users',
  SESSION: 'document_verify_session',
  HISTORY: 'document_verify_history',
  API_KEY: 'document_verify_gemini_api_key',
} as const;

function safeGetItem(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch (err) {
    console.error('Failed to read from localStorage:', err);
    return null;
  }
}

function safeSetItem(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch (err) {
    console.error('Failed to write to localStorage:', err);
  }
}

function safeRemoveItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (err) {
    console.error('Failed to remove from localStorage:', err);
  }
}

/* ================= Users ================= */

export function getAllUsers(): User[] {
  const data = safeGetItem(STORAGE_KEYS.USERS);
  if (!data) return [];
  try {
    return JSON.parse(data) as User[];
  } catch {
    return [];
  }
}

export function saveUser(user: User): void {
  const users = getAllUsers();
  const existingIdx = users.findIndex((u) => u.id === user.id);
  if (existingIdx >= 0) {
    users[existingIdx] = user;
  } else {
    users.push(user);
  }
  safeSetItem(STORAGE_KEYS.USERS, JSON.stringify(users));
}

export function findUserByName(name: string): User | undefined {
  const users = getAllUsers();
  return users.find((u) => u.name.trim().toLowerCase() === name.trim().toLowerCase());
}

export function findUserById(id: string): User | undefined {
  const users = getAllUsers();
  return users.find((u) => u.id === id);
}

export function deleteUserAccount(userId: string): void {
  const users = getAllUsers().filter((u) => u.id !== userId);
  safeSetItem(STORAGE_KEYS.USERS, JSON.stringify(users));

  // Also remove this user's history
  const allHistory = getAllHistoryRecords().filter((h) => h.userId !== userId);
  safeSetItem(STORAGE_KEYS.HISTORY, JSON.stringify(allHistory));

  // Clear session if it's the deleted user
  const currentSession = getActiveSessionUserId();
  if (currentSession === userId) {
    clearSession();
  }
}

/* ================= Session ================= */

export function getActiveSessionUserId(): string | null {
  return safeGetItem(STORAGE_KEYS.SESSION);
}

export function setActiveSession(userId: string): void {
  safeSetItem(STORAGE_KEYS.SESSION, userId);
}

export function clearSession(): void {
  safeRemoveItem(STORAGE_KEYS.SESSION);
}

/* ================= History (Advanced Mode Only) ================= */

function getAllHistoryRecords(): HistoryRecord[] {
  const data = safeGetItem(STORAGE_KEYS.HISTORY);
  if (!data) return [];
  try {
    return JSON.parse(data) as HistoryRecord[];
  } catch {
    return [];
  }
}

export function getUserHistory(userId: string): HistoryRecord[] {
  if (!userId) return [];
  const records = getAllHistoryRecords();
  return records
    .filter((r) => r.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function saveUserHistoryRecord(record: HistoryRecord): void {
  if (!record.userId) return;
  const records = getAllHistoryRecords();
  // Add new record at beginning
  records.unshift(record);
  safeSetItem(STORAGE_KEYS.HISTORY, JSON.stringify(records));
}

export function deleteUserHistoryRecord(recordId: string, userId: string): void {
  const records = getAllHistoryRecords().filter(
    (r) => !(r.id === recordId && r.userId === userId)
  );
  safeSetItem(STORAGE_KEYS.HISTORY, JSON.stringify(records));
}

/* ================= Optional Configured API Key ================= */

export function getConfiguredApiKey(): string {
  const customKey = safeGetItem(STORAGE_KEYS.API_KEY);
  if (customKey && customKey.trim()) {
    return customKey.trim();
  }
  // Check process.env.GEMINI_API_KEY if injected by Vite
  if (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) {
    return process.env.GEMINI_API_KEY;
  }
  return '';
}

export function saveConfiguredApiKey(key: string): void {
  safeSetItem(STORAGE_KEYS.API_KEY, key.trim());
}

export function clearConfiguredApiKey(): void {
  safeRemoveItem(STORAGE_KEYS.API_KEY);
}
