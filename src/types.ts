export const people = ['david', 'martina', 'both'] as const;
export type Person = (typeof people)[number];

export const categoryIds = [
    'pes',
    'odpad',
    'uklid',
    'pradlo',
    'jidlo-a-vareni',
    'nakupy',
    'deti',
    'opravy',
    'udrzba-spotrebicu',
    'finance-a-platby',
    'urady-a-administrativa',
    'auto',
    'ostatni',
] as const;
export type CategoryId = (typeof categoryIds)[number];

export type Duration = '5 min' | '15 min' | '30 min' | '60+ min';
export type Condition = 'běžné' | 'nepříjemné' | 'déšť/zima/brzo ráno' | 'náročné';
export type Necessity = 'nutné' | 'dohodnuté' | 'dobrovolné' | 'není společně potvrzené';

export interface WorkEntry {
    id: string;
    title: string;
    actor: Person;
    category: CategoryId;
    date: string;
    createdAt: string;
    forWhom?: string | undefined;
    duration?: Duration | undefined;
    condition?: Condition | undefined;
    necessity?: Necessity | undefined;
    note?: string | undefined;
    source: 'template' | 'custom';
}

export interface TaskTemplate {
    id: string;
    title: string;
    category: CategoryId;
    defaultForWhom?: string | undefined;
    defaultNecessity?: Necessity | undefined;
    isActive: boolean;
    sortOrder: number;
}

export interface EntryDraft {
    title: string;
    actor: Person;
    category: CategoryId;
    date: string;
    forWhom?: string | undefined;
    duration?: Duration | undefined;
    condition?: Condition | undefined;
    necessity?: Necessity | undefined;
    note?: string | undefined;
    source: 'template' | 'custom';
}

export interface SummaryBucket {
    actor: Person;
    total: number;
    categories: Array<{ category: CategoryId; count: number }>;
}
