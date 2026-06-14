import { defaultTemplates } from '../data/defaultTemplates';
import type { TaskTemplate, WorkEntry } from '../types';

const entriesKey = 'domaHotovo.entries';
const templatesKey = 'domaHotovo.templates';

function readJson<T>(key: string): T | null {
  const raw = localStorage.getItem(key);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function loadEntries(): WorkEntry[] {
  return readJson<WorkEntry[]>(entriesKey) ?? [];
}

export function saveEntries(entries: WorkEntry[]) {
  writeJson(entriesKey, entries);
}

export function loadTemplates(): TaskTemplate[] {
  const stored = readJson<TaskTemplate[]>(templatesKey);
  if (stored && stored.length > 0) {
    return stored;
  }

  writeJson(templatesKey, defaultTemplates);
  return defaultTemplates;
}

export function saveTemplates(templates: TaskTemplate[]) {
  writeJson(templatesKey, templates);
}

export function createId() {
  return crypto.randomUUID();
}