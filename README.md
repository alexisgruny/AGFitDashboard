# AGFitDashboard

Dashboard fitness personnel (Phase 1 / MVP) alimenté par export CSV manuel de Samsung Health.

Stack : Next.js 14 (App Router) + TypeScript strict, PostgreSQL via Prisma, Tailwind CSS, Recharts.

## Démarrage local

1. Configurer `DATABASE_URL` dans `.env` (une base PostgreSQL doit être joignable).
2. Appliquer la migration : `npx prisma migrate deploy` (ou `npx prisma migrate dev` en dev).
3. `npm install`
4. `npm run dev` puis ouvrir [http://localhost:3000](http://localhost:3000).

## Pages

- `/dashboard` : pas quotidiens (barres), calories (ligne), sommeil par phase (aires empilées), historique des entraînements (tableau). Sélecteur 7j/30j/90j.
- `/import` : upload CSV, feedback succès/erreur + nombre de lignes importées.
- `/goals` : CRUD objectifs personnels avec barre de progression.

## Import CSV

Le format Samsung Health réel n'était pas disponible lors de l'implémentation. Un format CSV
générique documenté est utilisé en attendant (voir `lib/csv-mapping.ts`, marqué `TODO`) :
une ligne par jour, colonnes `date, steps, calories_burned, distance_km,
sleep_duration_minutes, sleep_deep_minutes, sleep_light_minutes, sleep_rem_minutes,
sleep_awake_minutes, workout_type, workout_duration_minutes, workout_calories,
workout_avg_heart_rate, workout_distance_km`. Ajuster le mapping dans ce fichier une fois un
vrai export Samsung Health en main.
