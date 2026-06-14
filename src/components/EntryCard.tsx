import type { WorkEntry } from '../types';
import { actorLabel, byCategoryLabel, categoryColor } from '../utils/summary';
import { formatDateTime } from '../utils/date';

interface EntryCardProps {
  entry: WorkEntry;
  onDelete: (id: string) => void;
}

export function EntryCard({ entry, onDelete }: EntryCardProps) {
  return (
    <article className="entry-card">
      <div className="entry-card__top">
        <div>
          <div className="entry-card__meta">{formatDateTime(entry.date)}</div>
          <h3>{entry.title}</h3>
        </div>
        <button className="button button--ghost" type="button" onClick={() => onDelete(entry.id)}>
          Smazat
        </button>
      </div>
      <div className="entry-card__tags">
        <span className="tag">{actorLabel(entry.actor)}</span>
        <span className="tag" style={{ background: categoryColor(entry.category) }}>
          {byCategoryLabel(entry.category)}
        </span>
        <span className="tag tag--soft">{entry.source === 'template' ? 'Šablona' : 'Vlastní'}</span>
      </div>
      <div className="entry-card__details">
        {entry.forWhom ? <span>Pro: {entry.forWhom}</span> : null}
        {entry.duration ? <span>Čas: {entry.duration}</span> : null}
        {entry.condition ? <span>Podmínky: {entry.condition}</span> : null}
        {entry.necessity ? <span>Nutnost: {entry.necessity}</span> : null}
        {entry.note ? <span>Poznámka: {entry.note}</span> : null}
      </div>
    </article>
  );
}