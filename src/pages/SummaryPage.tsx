import { useMemo, useState } from 'react';
import { SectionCard } from '../components/SectionCard';
import type { WorkEntry } from '../types';
import { actorLabel, byCategoryLabel, dailyEntries, getInvisibleWork, getMainAreas, summarizeBuckets } from '../utils/summary';
import { formatDateTime, getTodayDateKey } from '../utils/date';

interface SummaryPageProps {
    entries: WorkEntry[];
}

export function SummaryPage({ entries }: SummaryPageProps) {
    const [expandedActor, setExpandedActor] = useState<'david' | 'martina' | 'both' | null>(null);
    const todayDate = new Date();
    const todayKey = getTodayDateKey();
    const todayEntries = dailyEntries(entries, todayKey);
    const buckets = summarizeBuckets(todayEntries);
    const invisible = getInvisibleWork(todayEntries);
    const mainAreas = getMainAreas(todayEntries).slice(0, 5);
    const todayLabel = new Intl.DateTimeFormat('cs-CZ', {
        dateStyle: 'long',
    }).format(todayDate);
    const entriesByActor = useMemo(
        () => ({
            david: todayEntries.filter((entry) => entry.actor === 'david'),
            martina: todayEntries.filter((entry) => entry.actor === 'martina'),
            both: todayEntries.filter((entry) => entry.actor === 'both'),
        }),
        [todayEntries],
    );

    function toggleActor(actor: 'david' | 'martina' | 'both') {
        setExpandedActor((current) => (current === actor ? null : actor));
    }

    function renderEntryDetails(entry: WorkEntry) {
        const details = [
            entry.forWhom ? `Pro: ${entry.forWhom}` : null,
            entry.duration ? `Čas: ${entry.duration}` : null,
            entry.condition ? `Podmínky: ${entry.condition}` : null,
            entry.necessity ? `Nutnost: ${entry.necessity}` : null,
            entry.note ? `Poznámka: ${entry.note}` : null,
        ].filter(Boolean) as string[];

        return (
            <article key={entry.id} className="summary-entry">
                <div className="summary-entry__title">{entry.title}</div>
                <div className="summary-entry__meta">
                    <span>{byCategoryLabel(entry.category)}</span>
                    <span>{formatDateTime(entry.date)}</span>
                </div>
                {details.length > 0 ? <div className="summary-entry__details">{details.join(' • ')}</div> : null}
            </article>
        );
    }

    return (
        <div className="page-stack">
            <SectionCard title="Dnešní přehled" subtitle={`Co je dnes hotovo. ${todayLabel}`}>
                <div className="summary-kpis">
                    <div className="kpi">
                        <strong>{todayEntries.length}</strong>
                        <span>záznamů</span>
                    </div>
                    <div className="kpi">
                        <strong>{buckets.filter((bucket) => bucket.total > 0).length}</strong>
                        <span>aktivní lidé dnes</span>
                    </div>
                </div>
            </SectionCard>

            <SectionCard title="Hlavní oblasti práce" subtitle="Dnešní kategorie a detaily podle člověka.">
                <div className="summary-lines">
                    {buckets.map((bucket) => (
                        <article key={bucket.actor} className="summary-line summary-line--interactive">
                            <button
                                type="button"
                                className="summary-line__toggle"
                                onClick={() => toggleActor(bucket.actor)}
                                aria-expanded={expandedActor === bucket.actor}
                            >
                                <span className="summary-line__toggle-label">
                                    <span>{actorLabel(bucket.actor)}</span>
                                    <span className="summary-line__toggle-hint">{expandedActor === bucket.actor ? 'Skrýt detail' : 'Zobrazit detail'}</span>
                                </span>
                                <span className="summary-line__toggle-icon" aria-hidden="true">
                                    {expandedActor === bucket.actor ? '⌃' : '⌄'}
                                </span>
                            </button>

                            <p>
                                dělal(a) hlavně:{' '}
                                {bucket.categories.length > 0
                                    ? bucket.categories
                                        .slice(0, 3)
                                        .map((item) => `${byCategoryLabel(item.category)} (${item.count})`)
                                        .join(', ')
                                    : 'dnes zatím bez záznamu'}
                            </p>

                            {expandedActor === bucket.actor ? (
                                <div className="summary-line__details">
                                    {entriesByActor[bucket.actor].length > 0 ? (
                                        entriesByActor[bucket.actor].map((entry) => renderEntryDetails(entry))
                                    ) : (
                                        <p className="empty-state">dnes zatím bez záznamu</p>
                                    )}
                                </div>
                            ) : null}
                        </article>
                    ))}
                    <article className="summary-line">
                        <h3>Společně a sdíleně</h3>
                        <p>
                            {mainAreas.length > 0
                                ? mainAreas
                                    .map((item) => `${byCategoryLabel(item.category)} (${item.count})`)
                                    .join(', ')
                                : 'dnes zatím bez záznamu'}
                        </p>
                    </article>
                </div>
            </SectionCard>

            <SectionCard title="Neviditelná práce" subtitle="Dnešní snadno přehlédnuté činnosti.">
                <div className="chip-row chip-row--wrap">
                    {invisible.length > 0 ? (
                        invisible.map((entry) => (
                            <span key={entry.id} className="tag tag--soft">
                                {entry.title}
                            </span>
                        ))
                    ) : (
                        <p className="empty-state">dnes zatím bez záznamu</p>
                    )}
                </div>
            </SectionCard>
        </div>
    );
}