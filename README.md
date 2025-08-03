# Frontend SE

This project uses Vite with React and Supabase. To run it locally you need to provide two environment variables and install the dependencies.

## Environment Variables

Create a `.env` file in the project root and add the Supabase connection details:

```bash
VITE_SUPABASE_URL=<your-supabase-url>
VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-supabase-service-role-key>
```

The `SUPABASE_SERVICE_ROLE_KEY` is required by the server-side endpoint to remove a user via the Supabase Admin API.

## Development Commands

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

Run the unit tests with:

```bash
npm test
```

Check the code style with:

```bash
npm run lint
```

## Dynamic Verification

After registering a user, Supabase sends a dynamic verification link to the provided e-mail address. The link redirects to the `/verify` route in this application where the verification is handled.

When signing up, Supabase emails a verification link to `${window.location.origin}/verify` (for example `https://frontend-se-cyan.vercel.app/verify` in production). The `Verify.jsx` page reads the `code` value from the URL and calls `supabase.auth.exchangeCodeForSession(code)` to create the session before finishing the sign-up flow.

## Account Deletion

To fully remove an account, the dashboard calls the server-side endpoint `/api/deleteUser` after deleting the user's data. This endpoint uses the Supabase Service Role key and invokes `auth.admin.deleteUser(userId)`.

## Rollenbasierte Nutzung

Nach der E-Mail-Bestätigung wird der Nutzer neben den Profildaten auch mit einer Rolle in der Tabelle `user_roles` gespeichert. Aus der Mail-Endung wird automatisch die Rolle `tutor` (bei `@web.de`) oder `student` bestimmt. Studierende können Projekte anlegen, bearbeiten und löschen, Tutoren sehen alle Projekte und können diese kommentieren.
