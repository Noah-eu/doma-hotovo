import { collection, deleteDoc, doc, getDocs, onSnapshot, orderBy, query, setDoc, updateDoc, writeBatch } from 'firebase/firestore';
import { defaultTemplates } from '../data/defaultTemplates';
import type { TaskTemplate, WorkEntry } from '../types';
import { firebaseHouseholdId, firestoreDb } from './firebaseApp';

function ensureFirestoreReady() {
    if (!firestoreDb) {
        throw new Error('Firebase databáze není dostupná.');
    }

    return firestoreDb;
}

function entriesCollectionRef() {
    return collection(ensureFirestoreReady(), 'households', firebaseHouseholdId, 'entries');
}

function templatesCollectionRef() {
    return collection(ensureFirestoreReady(), 'households', firebaseHouseholdId, 'templates');
}

function entryDocRef(entryId: string) {
    return doc(entriesCollectionRef(), entryId);
}

function templateDocRef(templateId: string) {
    return doc(templatesCollectionRef(), templateId);
}

function stripUndefined<T extends object>(value: T) {
    const record = value as Record<string, unknown>;
    return Object.fromEntries(Object.entries(record).filter(([, item]) => item !== undefined));
}

function mapEntryDoc(snapshot: { id: string; data: () => Record<string, unknown> }) {
    const data = snapshot.data();
    return {
        id: snapshot.id,
        title: String(data.title ?? ''),
        actor: data.actor as WorkEntry['actor'],
        category: data.category as WorkEntry['category'],
        date: String(data.date ?? ''),
        createdAt: String(data.createdAt ?? ''),
        forWhom: data.forWhom as string | undefined,
        duration: data.duration as WorkEntry['duration'],
        condition: data.condition as WorkEntry['condition'],
        necessity: data.necessity as WorkEntry['necessity'],
        note: data.note as string | undefined,
        source: data.source as WorkEntry['source'],
    } satisfies WorkEntry;
}

function mapTemplateDoc(snapshot: { id: string; data: () => Record<string, unknown> }) {
    const data = snapshot.data();
    return {
        id: snapshot.id,
        title: String(data.title ?? ''),
        category: data.category as TaskTemplate['category'],
        defaultForWhom: data.defaultForWhom as string | undefined,
        defaultNecessity: data.defaultNecessity as TaskTemplate['defaultNecessity'],
        isActive: Boolean(data.isActive),
        sortOrder: Number(data.sortOrder ?? 0),
    } satisfies TaskTemplate;
}

async function ensureDefaultTemplates(existingTemplates: TaskTemplate[]) {
    const missingDefaults = defaultTemplates.filter((template) => !existingTemplates.some((item) => item.id === template.id));
    if (missingDefaults.length === 0) {
        return false;
    }

    const batch = writeBatch(ensureFirestoreReady());
    for (const template of missingDefaults) {
        batch.set(templateDocRef(template.id), stripUndefined(template));
    }
    await batch.commit();
    return true;
}

export function subscribeEntries(onChange: (entries: WorkEntry[]) => void, onError?: (error: Error) => void) {
    if (!firestoreDb) {
        return () => undefined;
    }

    const entriesQuery = query(entriesCollectionRef(), orderBy('createdAt', 'desc'));
    return onSnapshot(
        entriesQuery,
        (snapshot) => {
            onChange(snapshot.docs.map((item) => mapEntryDoc(item)));
        },
        (error) => {
            onError?.(error as Error);
        },
    );
}

export function subscribeTemplates(onChange: (templates: TaskTemplate[]) => void, onError?: (error: Error) => void) {
    if (!firestoreDb) {
        return () => undefined;
    }

    const templatesQuery = query(templatesCollectionRef(), orderBy('sortOrder', 'asc'));
    return onSnapshot(
        templatesQuery,
        (snapshot) => {
            const nextTemplates = snapshot.docs.map((item) => mapTemplateDoc(item));
            onChange(nextTemplates);
            void ensureDefaultTemplates(nextTemplates).catch((error) => {
                onError?.(error as Error);
            });
        },
        (error) => {
            onError?.(error as Error);
        },
    );
}

export async function addEntry(entry: WorkEntry) {
    await setDoc(entryDocRef(entry.id), stripUndefined(entry));
}

export async function deleteEntry(entryId: string) {
    await deleteDoc(entryDocRef(entryId));
}

export async function saveTemplates(templates: TaskTemplate[]) {
    const batch = writeBatch(ensureFirestoreReady());
    for (const template of templates) {
        batch.set(templateDocRef(template.id), stripUndefined(template));
    }
    await batch.commit();
}

export async function addOrUpdateTemplate(template: TaskTemplate) {
    await setDoc(templateDocRef(template.id), stripUndefined(template), { merge: true });
}

export async function deactivateTemplate(templateId: string) {
    await updateDoc(templateDocRef(templateId), { isActive: false });
}

export async function refreshOnce() {
    if (!firestoreDb) {
        return { entries: [] as WorkEntry[], templates: [] as TaskTemplate[] };
    }

    const entriesSnapshot = await getDocs(query(entriesCollectionRef(), orderBy('createdAt', 'desc')));
    let templatesSnapshot = await getDocs(query(templatesCollectionRef(), orderBy('sortOrder', 'asc')));
    let templates = templatesSnapshot.docs.map((item) => mapTemplateDoc(item));

    if (await ensureDefaultTemplates(templates)) {
        templatesSnapshot = await getDocs(query(templatesCollectionRef(), orderBy('sortOrder', 'asc')));
        templates = templatesSnapshot.docs.map((item) => mapTemplateDoc(item));
    }

    return {
        entries: entriesSnapshot.docs.map((item) => mapEntryDoc(item)),
        templates,
    };
}

export async function migrateLocalEntriesToFirestore(entries: WorkEntry[]) {
    const db = ensureFirestoreReady();
    const batch = writeBatch(db);

    for (const entry of entries) {
        batch.set(entryDocRef(entry.id), stripUndefined(entry));
    }

    await batch.commit();
}
