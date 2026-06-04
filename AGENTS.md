# AGENTS.md

Vaste instructies voor toekomstige Codex-taken in dit project.

## Projectdoel

Deze webapp ondersteunt dagelijkse taakplanning voor een gezin. Gezinsleden
moeten taken en klusjes kunnen aanmaken, toewijzen aan personen, bekijken en
afvinken.

Houd de applicatie praktisch, overzichtelijk en gericht op de dagelijkse
thuisworkflow. Voeg nog geen complexe features toe als een kleine, duidelijke stap
voldoende is.

## Stack

- Next.js met App Router
- TypeScript
- Tailwind CSS
- Supabase voor database en gedeelde app-login
- Vercel-ready deployment
- npm als package manager

Let op: dit project gebruikt een moderne Next.js-versie. Controleer bij twijfel
de lokale Next.js-documentatie in `node_modules/next/dist/docs/` voordat je code
schrijft die afhankelijk is van frameworkdetails.

## Lokaal draaien

Installeer dependencies:

```bash
npm install
```

Maak een lokale environment file:

```bash
cp .env.example .env.local
```

Vul in `.env.local` minimaal deze waarden:

```bash
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
APP_ACCESS_PASSWORD=
APP_SESSION_SECRET=
```

Start de development server:

```bash
npm run dev
```

Open daarna `http://localhost:3000`.

## Build

Maak een productiebuild met:

```bash
npm run build
```

Start een productiebuild lokaal met:

```bash
npm run start
```

## Lint en tests

Voor iedere wijziging geldt:

```bash
npm run lint
npm run build
```

Er zijn Vitest- en Playwright-tests ingericht. Houd nieuwe tests gericht en
leesbaar. Test vooral gedrag dat belangrijk is voor taakplanning, authenticatie,
database-interactie en regressiegevoelige UI-logica.

## Codeconventies

- Schrijf eenvoudige, leesbare TypeScript.
- Gebruik duidelijke componentnamen die het domein beschrijven.
- Houd componenten klein en splits pas op wanneer dat de leesbaarheid verbetert.
- Gebruik Tailwind CSS direct in componenten zolang styling overzichtelijk blijft.
- Vermijd onnodige abstracties, globale state en generieke helpers.
- Gebruik bestaande projectpatronen voordat je nieuwe patronen introduceert.
- Houd UI-tekst helder, kort en Nederlands.
- Maak forms en interacties toegankelijk met labels, semantische HTML en duidelijke states.
- Gebruik environment variables voor configuratie; commit geen secrets.

## Mapstructuur

```text
src/
  app/
    globals.css
    layout.tsx
    page.tsx
  components/
    AppHeader.tsx
    TaskDayOverview.tsx
    TeamPageShell.tsx
  lib/
    supabase/
      server.ts
```

Richtlijn:

- `src/app/` bevat routes, layouts en globale styling.
- `src/components/` bevat herbruikbare UI-componenten.
- `src/lib/` bevat integraties, clients en gedeelde technische helpers.
- Supabase-gerelateerde code hoort onder `src/lib/supabase/` tenzij er een goede reden is voor een andere plek.

## Feature-aanpak

Bouw nieuwe features klein en incrementeel:

1. Voeg eerst het minimale werkende gedrag toe.
2. Houd wijzigingen per taak beperkt en controleerbaar.
3. Vermijd grote refactors samen met featurewerk.
4. Documenteer aannames wanneer gedrag nog tijdelijk of mock-based is.
5. Laat de app na iedere stap linten en builden.

## Databasewijzigingen

Databasewijzigingen moeten duidelijk worden gedocumenteerd. Beschrijf altijd:

- welke tabellen, kolommen, policies of functies wijzigen;
- waarom de wijziging nodig is;
- welke migratie of SQL moet worden uitgevoerd;
- welke environment variables of Supabase-instellingen nodig zijn;
- welke impact de wijziging heeft op bestaande data.

Voeg databasewijzigingen bij voorkeur toe als expliciete SQL- of migratiebestanden
zodra het project daar een vaste map voor heeft.
