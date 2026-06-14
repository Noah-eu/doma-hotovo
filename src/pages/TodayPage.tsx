import { useMemo, useState } from 'react';
import { TemplatePill } from '../components/TemplatePill';
import { SectionCard } from '../components/SectionCard';
import type { CategoryId, Condition, Duration, Necessity, Person, TaskTemplate, WorkEntry } from '../types';
import { actorLabel, byCategoryLabel, categoryColor } from '../utils/summary';
import { formatDateTime, toDateInputValue } from '../utils/date';

interface TodayPageProps {
    entries: WorkEntry[];
    templates: TaskTemplate[];
    onAddEntry: (payload: Omit<WorkEntry, 'id' | 'createdAt'>) => void;
    onDeleteEntry: (id: string) => void;
    activeActor: Person;
    onActiveActorChange: (actor: Person) => void;
    storageMode: 'local' | 'shared';
    lastLoadedAt: string;
    onReloadState: () => void;
    onMigrateLocalEntries?: (() => void) | undefined;
    savedMessage: string | null;
}

const people: Array<{ value: Person; label: string }> = [
    { value: 'david', label: 'David' },
    { value: 'martina', label: 'Martina' },
    { value: 'both', label: 'Společně' },
];

const categories: Array<{ value: CategoryId; label: string }> = [
    { value: 'pes', label: 'Pes' },
    { value: 'odpad', label: 'Odpad' },
    { value: 'uklid', label: 'Úklid' },
    { value: 'pradlo', label: 'Prádlo' },
    { value: 'jidlo-a-vareni', label: 'Jídlo a vaření' },
    { value: 'nakupy', label: 'Nákupy' },
    { value: 'deti', label: 'Děti' },
    { value: 'opravy', label: 'Opravy' },
    { value: 'udrzba-spotrebicu', label: 'Údržba spotřebičů' },
    { value: 'finance-a-platby', label: 'Finance a platby' },
    { value: 'urady-a-administrativa', label: 'Úřady a administrativa' },
    { value: 'auto', label: 'Auto' },
    { value: 'ostatni', label: 'Ostatní' },
];

const durations = ['5 min', '15 min', '30 min', '60+ min'] as const;

const conditions: Array<{ value: Condition; label: string }> = [
    { value: 'běžné', label: 'běžné' },
    { value: 'nepříjemné', label: 'nepříjemné' },
    { value: 'déšť/zima/brzo ráno', label: 'déšť/zima/brzo ráno' },
    { value: 'náročné', label: 'náročné' },
];

const necessities: Array<{ value: Necessity; label: string }> = [
    { value: 'nutné', label: 'nutné' },
    { value: 'dohodnuté', label: 'dohodnuté' },
    { value: 'dobrovolné', label: 'dobrovolné' },
    { value: 'není společně potvrzené', label: 'není společně potvrzené' },
];

const forWhomOptions = ['společná domácnost', 'děti Martiny', 'Evička', 'všechny děti', 'pes', 'David', 'Martina', 'všichni'];

export function TodayPage({
    entries,
    templates,
    onAddEntry,
    onDeleteEntry,
    activeActor,
    onActiveActorChange,
    storageMode,
    lastLoadedAt,
    onReloadState,
    onMigrateLocalEntries,
    savedMessage,
}: TodayPageProps) {
    const [activeCategory, setActiveCategory] = useState<CategoryId | null>(null);
    const [category, setCategory] = useState<CategoryId>('ostatni');
    const [title, setTitle] = useState('');
    const [date, setDate] = useState(toDateInputValue(new Date()));
    const [forWhom, setForWhom] = useState<'' | string>('');
    const [duration, setDuration] = useState<'' | Duration>('');
    const [condition, setCondition] = useState<'' | Condition>('');
    const [necessity, setNecessity] = useState<'' | Necessity>('');
    const [note, setNote] = useState('');
    const [showDetails, setShowDetails] = useState(false);

    const lastLoadedLabel = useMemo(
        () =>
            new Date(lastLoadedAt).toLocaleTimeString('cs-CZ', {
                hour: '2-digit',
                minute: '2-digit',
            }),
        [lastLoadedAt],
    );

    const todaysEntries = useMemo(
        () => entries.filter((entry) => entry.date.slice(0, 10) === date),
        [date, entries],
    );

    const groupedEntries = useMemo(
        () => ({
            david: todaysEntries.filter((entry) => entry.actor === 'david'),
            martina: todaysEntries.filter((entry) => entry.actor === 'martina'),
            both: todaysEntries.filter((entry) => entry.actor === 'both'),
        }),
        [todaysEntries],
    );

    const activeTemplates = templates.filter((template) => template.isActive).sort((left, right) => left.sortOrder - right.sortOrder);

    const availableCategories = categories;

    // Initialise the first available category once templates are known
    const resolvedActiveCategory = activeCategory ?? categories[0]?.value ?? null;

    const filteredTemplates = useMemo(
        () =>
            resolvedActiveCategory
                ? activeTemplates.filter((t) => t.category === resolvedActiveCategory)
                : activeTemplates,
        [activeTemplates, resolvedActiveCategory],
    );

    function resetForm() {
        setTitle('');
        setCategory('ostatni');
        setForWhom('');
        setDuration('');
        setCondition('');
        setNecessity('');
        setNote('');
        setShowDetails(false);
    }

    function submitEntry(source: 'template' | 'custom', templateTitle?: string, templateCategory?: CategoryId) {
        const finalTitle = source === 'template' ? templateTitle ?? title : title.trim();
        if (!finalTitle) {
            return;
        }

        onAddEntry({
            title: finalTitle,
            actor: activeActor,
            category: source === 'template' ? templateCategory ?? category : category,
            date: new Date(`${date}T12:00:00`).toISOString(),
            forWhom: forWhom || undefined,
            duration: duration || undefined,
            condition: condition || undefined,
            necessity: necessity || undefined,
            note: note.trim() || undefined,
            source,
        });
        resetForm();
    }

    return (
        <div className="page-stack">
            <SectionCard title="Zapisuje" subtitle="Vyber, kdo právě zapisuje úkoly.">
                <div className="actor-switch" role="group" aria-label="Zapisuje">
                    {people.map((person) => (
                        <button
                            key={person.value}
                            type="button"
                            className={activeActor === person.value ? 'actor-chip actor-chip--active' : 'actor-chip'}
                            onClick={() => onActiveActorChange(person.value)}
                        >
                            {person.label}
                        </button>
                    ))}
                </div>
                <div className="local-state-row">
                    <div>
                        {storageMode === 'shared'
                            ? 'Data se sdílí mezi přihlášenými členy domácnosti.'
                            : 'Data jsou zatím uložená jen v tomto zařízení.'}
                    </div>
                    <div>Naposledy načteno: {lastLoadedLabel}</div>
                    <div className="local-state-row__actions">
                        <button className="button button--ghost button--small" type="button" onClick={onReloadState}>
                            Obnovit stav
                        </button>
                        {storageMode === 'shared' && onMigrateLocalEntries ? (
                            <button className="button button--ghost button--small" type="button" onClick={onMigrateLocalEntries}>
                                Přenést lokální záznamy do sdílené databáze
                            </button>
                        ) : null}
                    </div>
                </div>
            </SectionCard>

            <SectionCard title="Rychlé šablony" subtitle="Vyber sekci a pak tapni na úkol.">
                {/* Category selector */}
                <div className="category-tabs">
                    {availableCategories.map((cat) => (
                        <button
                            key={cat.value}
                            type="button"
                            className={resolvedActiveCategory === cat.value ? 'category-tab category-tab--active' : 'category-tab'}
                            onClick={() => setActiveCategory(cat.value)}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>
                {/* Templates for the selected category */}
                <div className="template-list-grid">
                    {filteredTemplates.map((template) => (
                        <TemplatePill
                            key={template.id}
                            template={template}
                            onPick={(picked) => {
                                setTitle(picked.title);
                                setCategory(picked.category);
                                submitEntry('template', picked.title, picked.category);
                            }}
                        />
                    ))}
                </div>
                {filteredTemplates.length === 0 ? <p className="empty-state">V této sekci zatím nejsou aktivní šablony.</p> : null}
            </SectionCard>

            <SectionCard title="Rychlý vlastní záznam" subtitle="Stačí text, kdo to udělal a kategorie. Detaily jsou volitelné.">
                <div className="form-grid">
                    <label>
                        Co jsi udělal/a?
                        <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Např. vynesl odpad" />
                    </label>
                    <label>
                        Kdo to udělal
                        <select value={activeActor} onChange={(event) => onActiveActorChange(event.target.value as Person)}>
                            {people.map((person) => (
                                <option key={person.value} value={person.value}>
                                    {person.label}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label>
                        Kategorie
                        <select value={category} onChange={(event) => setCategory(event.target.value as CategoryId)}>
                            {categories.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label>
                        Datum
                        <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
                    </label>
                    <div className="form-actions">
                        <button className="button" type="button" onClick={() => submitEntry('custom')}>
                            Uložit
                        </button>
                        <button className="button button--ghost" type="button" onClick={() => setShowDetails((current) => !current)}>
                            {showDetails ? 'Skrýt detaily' : 'Rozbalit detaily'}
                        </button>
                    </div>
                </div>

                {showDetails ? (
                    <div className="form-grid form-grid--details">
                        <label>
                            Pro koho
                            <select value={forWhom} onChange={(event) => setForWhom(event.target.value)}>
                                <option value="">Bez výběru</option>
                                {forWhomOptions.map((option) => (
                                    <option key={option} value={option}>
                                        {option}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label>
                            Časová náročnost
                            <select value={duration} onChange={(event) => setDuration(event.target.value as '' | Duration)}>
                                <option value="">Bez výběru</option>
                                {durations.map((option) => (
                                    <option key={option} value={option}>
                                        {option}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label>
                            Podmínky
                            <select value={condition} onChange={(event) => setCondition(event.target.value as '' | Condition)}>
                                <option value="">Bez výběru</option>
                                {conditions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label>
                            Nutnost
                            <select value={necessity} onChange={(event) => setNecessity(event.target.value as '' | Necessity)}>
                                <option value="">Bez výběru</option>
                                {necessities.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label className="span-2">
                            Poznámka
                            <textarea value={note} onChange={(event) => setNote(event.target.value)} rows={3} placeholder="Doplňující poznámka" />
                        </label>
                    </div>
                ) : null}
            </SectionCard>

            {savedMessage ? <div className="saved-banner">{savedMessage}</div> : null}

            <SectionCard title="Dnes hotovo" subtitle="Přehled dne bez soutěžení, jen co kdo udělal.">
                <div className="today-groups">
                    {(['david', 'martina', 'both'] as const).map((person) => (
                        <div key={person} className="today-group">
                            <h3>{actorLabel(person)}</h3>
                            <div className="today-group__count">{groupedEntries[person].length} záznamů</div>
                            <div className="today-group__list">
                                {groupedEntries[person].length === 0 ? <p className="empty-state">Zatím nic.</p> : null}
                                {groupedEntries[person].map((entry) => (
                                    <article key={entry.id} className="mini-entry">
                                        <div className="mini-entry__line">
                                            <strong>{entry.title}</strong>
                                            <button className="button button--ghost button--small" type="button" onClick={() => onDeleteEntry(entry.id)}>
                                                Smazat
                                            </button>
                                        </div>
                                        <div className="entry-card__meta">{formatDateTime(entry.date)}</div>
                                        <div className="mini-entry__tags">
                                            <span className="tag" style={{ background: categoryColor(entry.category) }}>
                                                {byCategoryLabel(entry.category)}
                                            </span>
                                            {entry.forWhom ? <span className="tag tag--soft">Pro: {entry.forWhom}</span> : null}
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </SectionCard>
        </div>
    );
}