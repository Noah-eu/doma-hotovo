# Firebase Setup

1. Vytvoř Firebase projekt.
2. Přidej Web app v Firebase Console.
3. Zapni Authentication pro metodu Email/Password.
4. Vytvoř uživatele Davida a Martinu ručně v Authentication.
5. Vytvoř Firestore databázi.
6. Vytvoř dokument domácnosti `households/{VITE_FIREBASE_HOUSEHOLD_ID}`.
7. Přidej členy do `households/{householdId}/members/{uid}` podle UID přihlášených uživatelů.
8. Vlož pravidla z `firestore.rules.example` do Firestore Rules.
9. Nastav Netlify env proměnné:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
   - `VITE_FIREBASE_HOUSEHOLD_ID`
10. Přidej authorized domain pro Netlify aplikaci do Firebase Authentication.

Poznámka:
- `householdId` musí sedět s `VITE_FIREBASE_HOUSEHOLD_ID`.
- Firebase Hosting se nepoužívá, aplikace zůstává nasazená na Netlify.
