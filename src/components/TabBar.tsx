import type { ReactNode } from 'react';

export type TabId = 'today' | 'summary' | 'calendar' | 'admin';

interface TabBarProps {
  activeTab: TabId;
  onChange: (tab: TabId) => void;
}

const tabs: Array<{ id: TabId; label: string; icon: ReactNode }> = [
  { id: 'today', label: 'Dnes', icon: '•' },
  { id: 'summary', label: 'Přehled', icon: '•' },
  { id: 'calendar', label: 'Kalendář', icon: '•' },
  { id: 'admin', label: 'Admin', icon: '•' },
];

export function TabBar({ activeTab, onChange }: TabBarProps) {
  return (
    <nav className="tab-bar" aria-label="Hlavní navigace">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={tab.id === activeTab ? 'tab-bar__item tab-bar__item--active' : 'tab-bar__item'}
          type="button"
          onClick={() => onChange(tab.id)}
        >
          <span aria-hidden="true" className="tab-bar__icon">
            {tab.icon}
          </span>
          {tab.label}
        </button>
      ))}
    </nav>
  );
}