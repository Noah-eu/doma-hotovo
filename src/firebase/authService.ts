import { onAuthStateChanged, signInWithEmailAndPassword, signOut, type User } from 'firebase/auth';
import { firebaseAuth, isFirebaseConfigured } from './firebaseApp';

export type FirebaseUser = User;

export function subscribeAuth(onChange: (user: User | null) => void, onError?: (error: Error) => void) {
    if (!firebaseAuth) {
        return () => undefined;
    }

    return onAuthStateChanged(
        firebaseAuth,
        onChange,
        (error) => {
            onError?.(error as Error);
        },
    );
}

export async function signInWithCredentials(email: string, password: string) {
    if (!firebaseAuth) {
        throw new Error('Firebase není nakonfigurovaný.');
    }

    return signInWithEmailAndPassword(firebaseAuth, email.trim(), password);
}

export async function signOutUser() {
    if (!firebaseAuth) {
        return;
    }

    await signOut(firebaseAuth);
}

export function mapAuthErrorMessage(error: unknown) {
    const code = typeof error === 'object' && error && 'code' in error ? String((error as { code: string }).code) : '';

    switch (code) {
        case 'auth/invalid-email':
            return 'Email není ve správném formátu.';
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
            return 'Neplatný email nebo heslo.';
        case 'auth/too-many-requests':
            return 'Příliš mnoho pokusů. Zkus to prosím později.';
        case 'auth/operation-not-allowed':
            return 'Přihlašování email/heslo není ve Firebase zapnuté.';
        default:
            return isFirebaseConfigured ? 'Přihlášení se nezdařilo. Zkontroluj email a heslo.' : 'Firebase není nastavené.';
    }
}
