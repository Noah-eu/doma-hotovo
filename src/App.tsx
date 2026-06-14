import { useEffect, useMemo, useState } from 'react';
import { AdminPage } from './pages/AdminPage';
import { CalendarPage } from './pages/CalendarPage';
import { SummaryPage } from './pages/SummaryPage';
import { TodayPage } from './pages/TodayPage';
import { TabBar, type TabId } from './components/TabBar';
import { createId, loadEntries, loadTemplates, saveEntries, saveTemplates } from './storage/localStore';
import type { WorkEntry, TaskTemplate } from './types';

function App() {
  const [activeTab, setActiveTab] = useState<TabId>('today');
  const [entries, setEntries] = useState<WorkEntry[]>(() => loadEntries());
  const [templates, setTemplates] = useState<TaskTemplate[]>(() => loadTemplates());
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  useEffect(() => {
    saveEntries(entries);
  }, [entries]);

  useEffect(() => {
    saveTemplates(templates);
  }, [templates]);

  useEffect(() => {
    if (!savedMessage) {
      return;
    }

    const timeout = window.setTimeout(() => setSavedMessage(null), 1800);
    return () => window.clearTimeout(timeout);
  }, [savedMessage]);

  const orderedEntries = useMemo(() => [...entries].sort((left, right) => right.date.localeCompare(left.date)), [entries]);

  function addEntry(payload: Omit<WorkEntry, 'id' | 'createdAt'>) {
    setEntries((current) => [
      {
        ...payload,
        id: createId(),
        createdAt: new Date().toISOString(),
      },
      ...current,
    ]);
    setSavedMessage('Uloženo');
  }

  function deleteEntry(id: string) {
    setEntries((current) => current.filter((entry) => entry.id !== id));
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header__copy">
          <h1>Doma hotovo</h1>
          <p>Malý domácí deník toho, co kdo udělal.</p>
        </div>
      </header>

      <main className="app-main">
        {activeTab === 'today' ? (
          <TodayPage
            entries={orderedEntries}
            templates={templates}
            onAddEntry={addEntry}
            onDeleteEntry={deleteEntry}
            savedMessage={savedMessage}
          />
        ) : null}
        {activeTab === 'summary' ? <SummaryPage entries={orderedEntries} /> : null}
        {activeTab === 'calendar' ? <CalendarPage entries={orderedEntries} onDeleteEntry={deleteEntry} /> : null}
        {activeTab === 'admin' ? <AdminPage templates={templates} onUpdateTemplates={setTemplates} /> : null}
      </main>

      <TabBar activeTab={activeTab} onChange={setActiveTab} />
    </div>
  );
}

export default App;