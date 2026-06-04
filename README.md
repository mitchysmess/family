# Familie Kompas

Een Next.js app om thuis taken, klusjes en kleine afspraken bij te houden. Het
gezin logt in met een gedeeld wachtwoord. Daarna kun je taken aanmaken,
toewijzen aan gezinsleden, prioriteit geven, notities bijwerken en afvinken via
het dashboard of het compacte dagoverzicht.

## Stack

- Next.js met App Router
- TypeScript
- Tailwind CSS
- Supabase Postgres
- Vercel-ready deployment

## Installatie

```bash
npm install
cp .env.example .env.local
npm run dev
```

Vul in `.env.local` deze waarden in:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
APP_ACCESS_PASSWORD=kies-een-familiewachtwoord
APP_SESSION_SECRET=choose-a-long-random-session-secret
```

Open daarna `http://localhost:3000`.

## Scripts

- `npm run dev` start de lokale development server
- `npm run build` maakt een productiebuild
- `npm run start` start de productiebuild lokaal
- `npm run lint` draait ESLint
- `npm test` draait unit tests met Vitest
- `npm run test:e2e` draait browserflows met Playwright

## Supabase

De browser praat niet direct met Supabase. De app gebruikt eigen API routes onder
`src/app/api/`, beveiligd met een server-side cookie na de gedeelde login. Die
API routes gebruiken server-side `SUPABASE_SERVICE_ROLE_KEY`.

Voer in Supabase SQL Editor eerst uit:

```text
supabase/schema.sql
```

Voer daarna uit:

```text
supabase/policies.sql
```

Het schema bevat:

- `profiles`: gezinsleden die taken kunnen krijgen, inclusief optionele foto en profielkleur
- `tasks`: taken met status `open` of `done`, optionele toewijzing en prioriteit

Gezinsleden voeg je normaal toe via `/team`. De route heet nog `team` omdat de
onderliggende appstructuur zo simpel blijft, maar de interface gebruikt overal
gezinstaal.

Afgeronde taken worden maximaal 14 dagen bewaard. Bij het laden van de
takenlijst ruimt de server afgeronde taken op waarvan `updated_at` ouder is dan
14 dagen.

## Deployment

Vercel herkent dit project automatisch als Next.js app. Voeg bij Project
Settings > Environment Variables dezelfde waarden toe als in `.env.local`.

Controleer voor live zetten:

```bash
npm test
npm run test:e2e
npm run lint
npm run build
```

Test na deployment: login, taak aanmaken, taak afvinken, gezinslid toevoegen en
het dagoverzicht op mobiel.
