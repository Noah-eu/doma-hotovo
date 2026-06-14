import { useMemo, useState } from 'react';
import { SectionCard } from '../components/SectionCard';
import type { CategoryId, TaskTemplate } from '../types';
import { byCategoryLabel } from '../utils/summary';

interface AdminPageProps {
  templates: TaskTemplate[];
  onUpdateTemplates: (templates: TaskTemplate[]) => void;
}

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

export function AdminPage({ templates, onUpdateTemplates }: AdminPageProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<CategoryId>('ostatni');
  const [search, setSearch] = useState('');

  const visibleTemplates = useMemo(() => {
    return templates
      .filter((template) => template.title.toLowerCase().includes(search.toLowerCase()))
      .sort((left, right) => left.sortOrder - right.sortOrder);
  }, [search, templates]);

  function updateTemplate(id: string, updates: Partial<TaskTemplate>) {
    onUpdateTemplates(templates.map((template) => (template.id === id ? { ...template, ...updates } : template)));
  }

  function addTemplate() {
    if (!title.trim()) {
      return;
    }

    const nextSortOrder = templates.length > 0 ? Math.max(...templates.map((template) => template.sortOrder)) + 10 : 10;
    onUpdateTemplates([
      ...templates,
      {
        id: crypto.randomUUID(),
        title: title.trim(),
        category,
        isActive: true,
        sortOrder: nextSortOrder,
      },
    ]);
    setTitle('');
    setCategory('ostatni');
  }

  return (
    <div className="page-stack">
      <SectionCard title="Nová šablona" subtitle="Přidej další opakovaný domácí úkol bez opouštění aplikace.">
        <div className="form-grid">
          <label>
            Název
            <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Např. Objednat léky" />
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
          <div className="form-actions">
            <button className="button" type="button" onClick={addTemplate}>
              Přidat šablonu
            </button>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Šablony úkolů" subtitle="Lze upravit název, kategorii i aktivitu. Všechno je zatím uložené lokálně.">
        <label>
          Hledat
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Filtr šablon" />
        </label>
        <div className="template-list">
          {visibleTemplates.map((template) => (
            <article key={template.id} className="template-row">
              <div className="template-row__main">
                <input value={template.title} onChange={(event) => updateTemplate(template.id, { title: event.target.value })} />
                <select value={template.category} onChange={(event) => updateTemplate(template.id, { category: event.target.value as CategoryId })}>
                  {categories.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <label className="toggle">
                  <input type="checkbox" checked={template.isActive} onChange={(event) => updateTemplate(template.id, { isActive: event.target.checked })} />
                  Aktivní
                </label>
              </div>
              <div className="entry-card__meta">{byCategoryLabel(template.category)}</div>
            </article>
          ))}
          {visibleTemplates.length === 0 ? <p className="empty-state">Nic nenalezeno.</p> : null}
        </div>
      </SectionCard>
    </div>
  );
}