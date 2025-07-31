# Frontend SE

This project uses Vite with React and Supabase. To run it locally you need to provide two environment variables and install the dependencies.

## Environment Variables

Create a `.env` file in the project root and add the Supabase connection details:

```bash
VITE_SUPABASE_URL=<your-supabase-url>
VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>
```

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

When signing up, Supabase emails a dynamic verification link such as `https://localhost:5173/verify?code=...`. After the code is validated, Supabase redirects back to the page with the session tokens placed in the URL fragment, e.g. `https://localhost:5173/verify#access_token=...`. The `Verify.jsx` page uses `supabase.auth.getSessionFromUrl()` to extract those tokens and complete the sign-up flow.
