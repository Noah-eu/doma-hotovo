import { useMemo, useState } from 'react';
import { SectionCard } from '../components/SectionCard';
import type { WorkEntry } from '../types';
import { actorLabel, byCategoryLabel } from '../utils/summary';
import { formatMonthTitle, getMonthGrid, isCurrentMonthDay, isSameDay, toIsoDateKey } from '../utils/date';
import { formatDateTime } from '../utils/date';

interface CalendarPageProps {
  entries: WorkEntry[];
  onDeleteEntry: (id: string) => void;
}

export function CalendarPage({ entries, onDeleteEntry }: CalendarPageProps) {
  const [anchorDate, setAnchorDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(toIsoDateKey(new Date()));

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