import { useMemo, useState } from 'react';
import { SectionCard } from '../components/SectionCard';
import type { CategoryId, Condition, Duration, Necessity, Person, WorkEntry } from '../types';
import { actorLabel, byCategoryLabel } from '../utils/summary';
import { formatMonthTitle, getMonthGrid, isCurrentMonthDay, isSameDay, toIsoDateKey } from '../utils/date';
import { formatDateTime } from '../utils/date';

interface CalendarPageProps {
    entries: WorkEntry[];
    onAddEntry: (payload: Omit<WorkEntry, 'id' | 'createdAt'>) => void;
    onDeleteEntry: (id: string) => void;
    activeActor: Person;
    onActiveActorChange: (actor: Person) => void;
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

export function CalendarPage({ entries, onAddEntry, onDeleteEntry, activeActor, onActiveActorChange, savedMessage }: CalendarPageProps) {
    const [anchorDate, setAnchorDate] = useState(new Date());
    const [selectedDay, setSelectedDay] = useState(toIsoDateKey(new Date()));
    const [isAddingEntry, setIsAddingEntry] = useState(false);
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState<CategoryId>('ostatni');
    const [forWhom, setForWhom] = useState<'' | string>('');
    const [duration, setDuration] = useState<'' | Duration>('');
    const [condition, setCondition] = useState<'' | Condition>('');
    const [necessity, setNecessity] = useState<'' | Necessity>('');
    const [note, setNote] = useState('');
    const [showDetails, setShowDetails] = useState(false);

    const monthGrid = useMemo(() => getMonthGrid(anchorDate), [anchorDate]);
    const selectedEntries = entries.filter((entry) => isSameDay(entry.date, selectedDay));
    const countByDay = useMemo(() => {
        const map = new Map<string, number>();
        for (const entry of entries) {
            const key = entry.date.slice(0, 10);
            map.set(key, (map.get(key) ?? 0) + 1);
        }
        return map;
    }, [entries]);

    function resetAddForm() {
        setTitle('');
        setCategory('ostatni');
        setForWhom('');
        setDuration('');
        setCondition('');
        setNecessity('');
        setNote('');
        setShowDetails(false);
    }

    function closeAddForm() {
        setIsAddingEntry(false);
        resetAddForm();
    }

    function submitEntryForSelectedDay() {
        const finalTitle = title.trim();
        if (!finalTitle) {
            return;
        }

        onAddEntry({
            title: finalTitle,
            actor: activeActor,
            category,
            date: new Date(`${selectedDay}T12:00:00`).toISOString(),
            forWhom: forWhom || undefined,
            duration: duration || undefined,
            condition: condition || undefined,
            necessity: necessity || undefined,
            note: note.trim() || undefined,
            source: 'custom',
        });

        closeAddForm();
    }

    return (
        <div className="page-stack">
            <SectionCard
                title={formatMonthTitle(anchorDate)}
                subtitle="Klikni na den a zobrazí se jeho záznamy."
                action={
                    <div className="month-nav">
                        <button className="button button--ghost button--small" type="button" onClick={() => setAnchorDate(new Date(anchorDate.getFullYear(), anchorDate.getMonth() - 1, 1))}>
                            Předchozí
                        </button>
                        <button className="button button--ghost button--small" type="button" onClick={() => setAnchorDate(new Date())}>
                            Dnes
                        </button>
                        <button className="button button--ghost button--small" type="button" onClick={() => setAnchorDate(new Date(anchorDate.getFullYear(), anchorDate.getMonth() + 1, 1))}>
                            Další
                        </button>
                    </div>
                }
            >
                <div className="calendar-grid calendar-grid--header">
                    {['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'].map((day) => (
                        <span key={day}>{day}</span>
                    ))}
                </div>
                <div className="calendar-grid">
                    {monthGrid.map((day) => {
                        const key = toIsoDateKey(day);
                        const count = countByDay.get(key) ?? 0;
                        const current = isCurrentMonthDay(day, anchorDate);
                        return (
                            <button
                                key={key}
                                type="button"
                                className={current && key === selectedDay ? 'calendar-day calendar-day--active' : current ? 'calendar-day' : 'calendar-day calendar-day--muted'}
                                onClick={() => {
                                    setSelectedDay(key);
                                    setAnchorDate(day);
                                }}
                            >
                                <span>{day.getDate()}</span>
                                <strong>{count}</strong>
                            </button>
                        );
                    })}
                </div>
            </SectionCard>

            <SectionCard title="Záznamy vybraného dne" subtitle={selectedDay}>
                <div className="calendar-day-actions">
                    {!isAddingEntry ? (
                        <button className="button" type="button" onClick={() => setIsAddingEntry(true)}>
                            Přidat záznam k tomuto dni
                        </button>
                    ) : null}
                </div>

                {isAddingEntry ? (
                    <div className="calendar-add-panel">
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
                                <input type="date" value={selectedDay} readOnly />
                            </label>
                            <div className="form-actions">
                                <button className="button" type="button" onClick={submitEntryForSelectedDay}>
                                    Uložit
                                </button>
                                <button className="button button--ghost" type="button" onClick={closeAddForm}>
                                    Zrušit
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
                    </div>
                ) : null}

                {savedMessage ? <div className="saved-banner">{savedMessage}</div> : null}

                <div className="today-group__list">
                    {selectedEntries.length === 0 ? <p className="empty-state">Na tento den zatím nic není.</p> : null}
                    {selectedEntries.map((entry) => (
                        <article key={entry.id} className="entry-card">
                            <div className="entry-card__top">
                                <div>
                                    <div className="entry-card__meta">{formatDateTime(entry.date)}</div>
                                    <h3>{entry.title}</h3>
                                </div>
                                <button className="button button--ghost" type="button" onClick={() => onDeleteEntry(entry.id)}>
                                    Smazat
                                </button>
                            </div>
                            <div className="entry-card__tags">
                                <span className="tag">{actorLabel(entry.actor)}</span>
                                <span className="tag tag--soft">{byCategoryLabel(entry.category)}</span>
                            </div>
                        </article>
                    ))}
                </div>
            </SectionCard>
        </div>
    );
}