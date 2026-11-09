# Quiz to Glory

A football quiz and squad-building game built with React, TypeScript, Vite, and Supabase.

## Getting started

1. Install Node.js (LTS).
2. Install dependencies: `npm install`
3. Create a `.env` file in the project root using `.env.example` as a template.
4. Set your Supabase Project URL and the browser-safe anon/publishable key.
5. Start the app: `npm run dev`

## Supabase Authentication setup

The app uses Supabase Auth for email/password registration, login, logout, and player display names. No custom SQL table is needed for these authentication/profile fields: the display name is stored in the authenticated user's metadata.

In the Supabase dashboard:

1. Open **Authentication → Providers → Email** and make sure email/password sign-in is enabled.
2. Under **Authentication → URL Configuration**, set the Site URL to your deployed app URL. During local development, add `http://localhost:5173` to the allowed redirect URLs.
3. Choose whether to require email confirmation. When confirmation is enabled, a new account must open the confirmation email before logging in.
4. In **Project Settings → API**, copy the Project URL and the anon/publishable browser key into `.env`. Never use the `service_role` key in frontend code.

Each authenticated user's game data is stored under a user-specific browser storage key, so two accounts on the same browser do not share coins, players, squad, quiz session, or progress. Existing anonymous progress is migrated to the first account that signs in on that browser. Game progress is currently stored locally in that browser; it does not yet sync between devices.

The existing player catalogue still uses the `players` table through `src/data/api.ts`. Keep its existing table and read permissions configured in Supabase for player packs and draft features to load database players.

## Available scripts

- `npm run dev` — start the development server.
- `npm run build` — type-check and build the production app.
- `npm run lint` — run ESLint.
- `npm run preview` — preview the production build.
