import { SectionCard } from '../components/SectionCard';
import type { WorkEntry } from '../types';
import { actorLabel, byCategoryLabel, getInvisibleWork, getMainAreas, summarizeBuckets } from '../utils/summary';
import { monthlyEntries, weeklyEntries } from '../utils/summary';

interface SummaryPageProps {
    entries: WorkEntry[];
}

export function SummaryPage({ entries }: SummaryPageProps) {
    const now = new Date();
    const weekEntries = weeklyEntries(entries, now);
    const monthEntries = monthlyEntries(entries, now);
    const buckets = summarizeBuckets(monthEntries);
    const invisible = getInvisibleWork(monthEntries);
    const mainAreas = getMainAreas(monthEntries).slice(0, 5);

    return (
        <div className="page-stack">
            <SectionCard title="Tento týden" subtitle="Kolik záznamů vzniklo bez jakéhokoli skóre.">
                <div className="summary-kpis">
                    <div className="kpi">
                        <strong>{weekEntries.length}</strong>
                        <span>záznamů</span>
                    </div>
                    <div className="kpi">
                        <strong>{monthEntries.length}</strong>
                        <span>tento měsíc</span>
                    </div>
                </div>
            </SectionCard>

            <SectionCard title="Hlavní oblasti práce" subtitle="Co se doma opakuje nejčastěji.">
                <div className="summary-lines">
                    {buckets.map((bucket) => (
                        <article key={bucket.actor} className="summary-line">
                            <h3>{actorLabel(bucket.actor)}</h3>
                            <p>
                                dělal(a) hlavně:{' '}
                                {bucket.categories.length > 0
                                    ? bucket.categories
                                        .slice(0, 3)
                                        .map((item) => `${byCategoryLabel(item.category)} (${item.count})`)
                                        .join(', ')
                                    : 'zatím bez záznamu'}
                            </p>
                        </article>
                    ))}
                    <article className="summary-line">
                        <h3>Společně a sdíleně</h3>
                        <p>
                            {mainAreas.length > 0
                                ? mainAreas
                                    .map((item) => `${byCategoryLabel(item.category)} (${item.count})`)
                                    .join(', ')
                                : 'zatím bez záznamu'}
                        </p>
                    </article>
                </div>
            </SectionCard>

            <SectionCard title="Neviditelná práce" subtitle="Kategorie, které bývají snadno přehlédnuté.">
                <div className="chip-row chip-row--wrap">
                    {invisible.length > 0 ? (
                        invisible.map((entry) => (
                            <span key={entry.id} className="tag tag--soft">
                                {entry.title}
                            </span>
                        ))
                    ) : (
                        <p className="empty-state">Zatím žádné záznamy v této oblasti.</p>
                    )}
                </div>
            </SectionCard>
        </div>
    );
}