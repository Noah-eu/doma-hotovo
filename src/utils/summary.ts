import type { CategoryId, Person, SummaryBucket, WorkEntry } from '../types';
import { startOfMonth, startOfWeek } from './date';

const invisibleCategories: CategoryId[] = [
  'opravy',
  'udrzba-spotrebicu',
  'finance-a-platby',
  'urady-a-administrativa',
  'auto',
];

export function filterEntriesByRange(entries: WorkEntry[], start: Date, end: Date) {
  const startIso = start.toISOString();
  const endIso = end.toISOString();
  return entries.filter((entry) => entry.date >= startIso && entry.date < endIso);
}

export function summarizeByActor(entries: WorkEntry[], actor: Person) {
  const actorEntries = entries.filter((entry) => entry.actor === actor);
  const categoryMap = new Map<CategoryId, number>();

  for (const entry of actorEntries) {
    categoryMap.set(entry.category, (categoryMap.get(entry.category) ?? 0) + 1);
  }

  return {
    actor,
    total: actorEntries.length,
    categories: [...categoryMap.entries()]
      .map(([category, count]) => ({ category, count }))
      .sort((left, right) => right.count - left.count),
  };
}

export function summarizeBuckets(entries: WorkEntry[]): SummaryBucket[] {
  return (['david', 'martina', 'both'] as const).map((actor) => summarizeByActor(entries, actor));
}

export function getMainAreas(entries: WorkEntry[]) {
  const counts = new Map<CategoryId, number>();
  for (const entry of entries) {
    counts.set(entry.category, (counts.get(entry.category) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([category, count]) => ({ category, count }))
    .sort((left, right) => right.count - left.count);
}

export function getInvisibleWork(entries: WorkEntry[]) {
  return entries.filter((entry) => invisibleCategories.includes(entry.category));
}

export function weeklyEntries(entries: WorkEntry[], anchorDate: Date) {
  const start = startOfWeek(anchorDate);
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  return filterEntriesByRange(entries, start, end);
}

export function monthlyEntries(entries: WorkEntry[], anchorDate: Date) {
  const start = startOfMonth(anchorDate);
  const end = new Date(start.getFullYear(), start.getMonth() + 1, 1);
  return filterEntriesByRange(entries, start, end);
}

export function byCategoryLabel(category: CategoryId) {
  const labels: Record<CategoryId, string> = {
    pes: 'Pes',
    odpad: 'Odpad',
    uklid: 'Úklid',
    pradlo: 'Prádlo',
    'jidlo-a-vareni': 'Jídlo a vaření',
    nakupy: 'Nákupy',
    deti: 'Děti',
    opravy: 'Opravy',
    'udrzba-spotrebicu': 'Údržba spotřebičů',
    'finance-a-platby': 'Finance a platby',
    'urady-a-administrativa': 'Úřady a administrativa',
    auto: 'Auto',
    ostatni: 'Ostatní',
  };

  return labels[category];
}

export function actorLabel(actor: Person) {
  return actor === 'david' ? 'David' : actor === 'martina' ? 'Martina' : 'Oba';
}

export function categoryColor(category: CategoryId) {
  const tones: Record<CategoryId, string> = {
    pes: 'var(--tone-peach)',
    odpad: 'var(--tone-sand)',
    uklid: 'var(--tone-mint)',
    pradlo: 'var(--tone-blue)',
    'jidlo-a-vareni': 'var(--tone-gold)',
    nakupy: 'var(--tone-lilac)',
    deti: 'var(--tone-coral)',
    opravy: 'var(--tone-stone)',
    'udrzba-spotrebicu': 'var(--tone-stone)',
    'finance-a-platby': 'var(--tone-gold)',
    'urady-a-administrativa': 'var(--tone-sand)',
    auto: 'var(--tone-blue)',
    ostatni: 'var(--tone-mint)',
  };

  return tones[category];
}