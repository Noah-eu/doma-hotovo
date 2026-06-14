import { type FormEvent, useEffect, useMemo, useState } from 'react';
import { AdminPage } from './pages/AdminPage';
import { CalendarPage } from './pages/CalendarPage';
import { SummaryPage } from './pages/SummaryPage';
import { TodayPage } from './pages/TodayPage';
import { TabBar, type TabId } from './components/TabBar';
import { createId, loadActiveActor, loadEntries, loadTemplates, saveActiveActor, saveEntries as saveLocalEntries, saveTemplates as saveLocalTemplates } from './storage/localStore';
import type { Person, WorkEntry, TaskTemplate } from './types';
import { mapAuthErrorMessage, signInWithCredentials, signOutUser, subscribeAuth } from './firebase/authService';
import { isFirebaseConfigured } from './firebase/firebaseApp';
import {
    addEntry as addFirestoreEntry,
    deleteEntry as deleteFirestoreEntry,
    migrateLocalEntriesToFirestore,
    refreshOnce,
    saveTemplates as saveFirestoreTemplates,
    subscribeEntries,
    subscribeTemplates,
} from './firebase/firestoreStore';

type StorageMode = 'local' | 'shared';

function App() {
    const [activeTab, setActiveTab] = useState<TabId>('today');
    const [entries, setEntries] = useState<WorkEntry[]>(() => loadEntries());
    const [templates, setTemplates] = useState<TaskTemplate[]>(() => loadTemplates());
    const [activeActor, setActiveActor] = useState<Person>(() => loadActiveActor());
    const [lastLoadedAt, setLastLoadedAt] = useState<string>(() => new Date().toISOString());
    const [savedMessage, setSavedMessage] = useState<string | null>(null);
    const [authUser, setAuthUser] = useState<{ uid: string; email: string | null } | null>(null);
    const [authReady, setAuthReady] = useState(!isFirebaseConfigured);
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [loginError, setLoginError] = useState<string | null>(null);
    const [isSigningIn, setIsSigningIn] = useState(false);

    const storageMode: StorageMode = isFirebaseConfigured && authUser ? 'shared' : 'local';
    const isSharedMode = storageMode === 'shared';

    useEffect(() => {
        if (!isFirebaseConfigured) {
            return;
        }

        const unsubscribe = subscribeAuth(
            (user) => {
                setAuthUser(user ? { uid: user.uid, email: user.email } : null);
                setAuthReady(true);
            },
            () => {
                setAuthReady(true);
            },
        );

        return unsubscribe;
    }, []);

    useEffect(() => {
        if (!isSharedMode) {
            saveLocalEntries(entries);
        }
    }, [entries, isSharedMode]);

    useEffect(() => {
        if (!isSharedMode) {
            saveLocalTemplates(templates);
        }
    }, [templates, isSharedMode]);

    useEffect(() => {
        saveActiveActor(activeActor);
    }, [activeActor]);

    useEffect(() => {
        if (!isSharedMode) {
            setEntries(loadEntries());
            setTemplates(loadTemplates());
            setLastLoadedAt(new Date().toISOString());
            return;
        }

        const unsubscribeEntries = subscribeEntries(
            (nextEntries) => {
                setEntries(nextEntries);
                setLastLoadedAt(new Date().toISOString());
            },
            () => {
                setSavedMessage('Načtení z Firestore se nezdařilo');
            },
        );

        const unsubscribeTemplates = subscribeTemplates(
            (nextTemplates) => {
                setTemplates(nextTemplates);
            },
            () => {
                setSavedMessage('Načtení šablon z Firestore se nezdařilo');
            },
        );

        return () => {
            unsubscribeEntries();
            unsubscribeTemplates();
        };
    }, [isSharedMode]);

    useEffect(() => {
        if (!savedMessage) {
            return;
        }

        const timeout = window.setTimeout(() => setSavedMessage(null), 1800);
        return () => window.clearTimeout(timeout);
    }, [savedMessage]);

    const orderedEntries = useMemo(() => [...entries].sort((left, right) => right.date.localeCompare(left.date)), [entries]);

    function addEntry(payload: Omit<WorkEntry, 'id' | 'createdAt'>) {
        const newEntry: WorkEntry = {
            ...payload,
            id: createId(),
            createdAt: new Date().toISOString(),
        };

        if (isSharedMode) {
            void addFirestoreEntry(newEntry)
                .then(() => {
                    setSavedMessage('Uloženo');
                })
                .catch(() => {
                    setSavedMessage('Uložení do sdílené databáze se nezdařilo');
                });
            return;
        }

        setEntries((current) => [newEntry, ...current]);
        setSavedMessage('Uloženo');
    }

    function deleteEntry(id: string) {
        if (isSharedMode) {
            void deleteFirestoreEntry(id).catch(() => {
                setSavedMessage('Smazání ve sdílené databázi se nezdařilo');
            });
            return;
        }

        setEntries((current) => current.filter((entry) => entry.id !== id));
    }

    function reloadState() {
        if (isSharedMode) {
            void refreshOnce()
                .then((snapshot) => {
                    setEntries(snapshot.entries);
                    setTemplates(snapshot.templates);
                    setActiveActor(loadActiveActor());
                    setLastLoadedAt(new Date().toISOString());
                    setSavedMessage('Stav obnoven');
                })
                .catch(() => {
                    setSavedMessage('Obnovení ze sdílené databáze se nezdařilo');
                });
            return;
        }

        setEntries(loadEntries());
        setTemplates(loadTemplates());
        setActiveActor(loadActiveActor());
        setLastLoadedAt(new Date().toISOString());
        setSavedMessage('Stav obnoven');
    }

    function handleUpdateTemplates(nextTemplates: TaskTemplate[]) {
        if (isSharedMode) {
            setTemplates(nextTemplates);
            void saveFirestoreTemplates(nextTemplates).catch(() => {
                setSavedMessage('Uložení šablon do sdílené databáze se nezdařilo');
            });
            return;
        }

        setTemplates(nextTemplates);
    }

    function migrateLocalEntries() {
        if (!isSharedMode) {
            return;
        }

        const localEntries = loadEntries();
        if (localEntries.length === 0) {
            setSavedMessage('Lokální záznamy nejsou k dispozici');
            return;
        }

        void migrateLocalEntriesToFirestore(localEntries)
            .then(() => {
                setSavedMessage('Lokální záznamy přeneseny');
                return refreshOnce();
            })
            .then((snapshot) => {
                if (!snapshot) {
                    return;
                }
                setEntries(snapshot.entries);
                setTemplates(snapshot.templates);
                setLastLoadedAt(new Date().toISOString());
            })
            .catch(() => {
                setSavedMessage('Přenos lokálních záznamů se nezdařil');
            });
    }

    async function handleLogin(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsSigningIn(true);
        setLoginError(null);

        try {
            await signInWithCredentials(loginEmail, loginPassword);
        } catch (error) {
            setLoginError(mapAuthErrorMessage(error));
        } finally {
            setIsSigningIn(false);
        }
    }

    function handleSignOut() {
        void signOutUser();
    }

    if (isFirebaseConfigured && !authReady) {
        return (
            <div className="app-shell">
                <main className="app-main">
                    <section className="section-card login-card">
                        <h2>Načítám přihlášení...</h2>
                    </section>
                </main>
            </div>
        );
    }

    if (isFirebaseConfigured && !authUser) {
        return (
            <div className="app-shell">
                <main className="app-main">
                    <section className="section-card login-card">
                        <h1>Doma hotovo</h1>
                        <p>Přihlášení pro sdílený domácí deník.</p>
                        <form className="login-form" onSubmit={handleLogin}>
                            <label>
                                Email
                                <input
                                    type="email"
                                    value={loginEmail}
                                    onChange={(event) => setLoginEmail(event.target.value)}
                                    autoComplete="email"
                                    required
                                />
                            </label>
                            <label>
                                Heslo
                                <input
                                    type="password"
                                    value={loginPassword}
                                    onChange={(event) => setLoginPassword(event.target.value)}
                                    autoComplete="current-password"
                                    required
                                />
                            </label>
                            <button className="button" type="submit" disabled={isSigningIn}>
                                {isSigningIn ? 'Přihlašuji...' : 'Přihlásit'}
                            </button>
                            {loginError ? <p className="login-error">{loginError}</p> : null}
                        </form>
                    </section>
                </main>
            </div>
        );
    }

    return (
        <div className="app-shell">
            <header className="app-header">
                <div className="app-header__copy">
                    <h1>Doma hotovo</h1>
                    <p>Malý domácí deník toho, co kdo udělal.</p>
                    <p className="install-hint">Pro instalaci na mobil otevři menu prohlížeče a zvol Přidat na plochu.</p>
                    {isSharedMode ? (
                        <div className="app-header__session">
                            <span>{authUser?.email}</span>
                            <button type="button" className="button button--ghost button--small" onClick={handleSignOut}>
                                Odhlásit
                            </button>
                        </div>
                    ) : null}
                </div>
            </header>

            <main className="app-main">
                {activeTab === 'today' ? (
                    <TodayPage
                        entries={orderedEntries}
                        templates={templates}
                        onAddEntry={addEntry}
                        onDeleteEntry={deleteEntry}
                        activeActor={activeActor}
                        onActiveActorChange={setActiveActor}
                        storageMode={storageMode}
                        lastLoadedAt={lastLoadedAt}
                        onReloadState={reloadState}
                        onMigrateLocalEntries={isSharedMode ? migrateLocalEntries : undefined}
                        savedMessage={savedMessage}
                    />
                ) : null}
                {activeTab === 'summary' ? <SummaryPage entries={orderedEntries} /> : null}
                {activeTab === 'calendar' ? (
                    <CalendarPage
                        entries={orderedEntries}
                        onAddEntry={addEntry}
                        onDeleteEntry={deleteEntry}
                        activeActor={activeActor}
                        onActiveActorChange={setActiveActor}
                        savedMessage={savedMessage}
                    />
                ) : null}
                {activeTab === 'admin' ? <AdminPage templates={templates} onUpdateTemplates={handleUpdateTemplates} /> : null}
            </main>

            <TabBar activeTab={activeTab} onChange={setActiveTab} />
        </div>
    );
}

export default App;