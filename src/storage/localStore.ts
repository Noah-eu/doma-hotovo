import { defaultTemplates } from '../data/defaultTemplates';
import type { Person, TaskTemplate, WorkEntry } from '../types';

const entriesKey = 'domaHotovo.entries';
const templatesKey = 'domaHotovo.templates';
const activeActorKey = 'domaHotovo.activeActor';

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
        return migrateTemplates(stored);
    }

    writeJson(templatesKey, defaultTemplates);
    return defaultTemplates;
}

export function saveTemplates(templates: TaskTemplate[]) {
    writeJson(templatesKey, templates);
}

export function loadActiveActor(): Person {
    const stored = readJson<string>(activeActorKey);
    if (stored === 'david' || stored === 'martina' || stored === 'both') {
        return stored;
    }
    return 'david';
}

export function saveActiveActor(actor: Person) {
    writeJson(activeActorKey, actor);
}

export function createId() {
    return crypto.randomUUID();
}

/** One-time migration: replace the old combined template with the two split ones. */
function migrateTemplates(templates: TaskTemplate[]): TaskTemplate[] {
    let migrated = templates;

    const hasOld = migrated.some((template) => template.id === 'uklid-bytovka');
    const hasNew = migrated.some((template) => template.id === 'uklid-koupelna');
    if (hasOld && !hasNew) {
        const oldIndex = migrated.findIndex((template) => template.id === 'uklid-bytovka');
        migrated = [...migrated];
        migrated.splice(
            oldIndex,
            1,
            { id: 'uklid-koupelna', title: 'Uklidit koupelnu', category: 'uklid', isActive: true, sortOrder: 80 },
            { id: 'uklid-zachod', title: 'Uklidit záchod', category: 'uklid', isActive: true, sortOrder: 85 },
        );
    }

    const existingIds = new Set(migrated.map((template) => template.id));
    const missingDefaults = defaultTemplates.filter((template) => !existingIds.has(template.id));
    if (missingDefaults.length === 0) {
        if (migrated !== templates) {
            const sortedMigrated = [...migrated].sort((left, right) => left.sortOrder - right.sortOrder);
            writeJson(templatesKey, sortedMigrated);
            return sortedMigrated;
        }

        return migrated;
    }

    const merged = [...migrated, ...missingDefaults].sort((left, right) => left.sortOrder - right.sortOrder);
    writeJson(templatesKey, merged);
    return merged;
}