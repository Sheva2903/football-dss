# Football DSS

Live app: https://football-dss.vercel.app/

Express + PostgreSQL backend plus React frontend for a football recruitment decision support system.

Legacy/reference project: [dw-football-dss](https://github.com/Sheva2903/dw-football-dss)

## Tech stack

- Node.js 22
- Express.js 5
- PostgreSQL 16
- Sequelize CLI migrations
- Raw SQL for mart and analytical queries
- Zod validation
- Swagger / OpenAPI
- Docker Compose

## What it does

- Ingests raw football CSV datasets
- Loads normalized warehouse tables in PostgreSQL
- Builds analytical mart tables for scouting and ranking
- Exposes read-focused APIs for players, rankings, shortlists, score explanation, and similar alternatives

## Project flow

```text
CSV files -> warehouse schema -> mart schema -> Express API
```

### 1. Source data

Put source CSVs in `data/source/`.

### 2. Warehouse refresh

Load dimension and fact tables into the `warehouse` schema.

```bash
npm run etl:warehouse
```

### 3. Mart refresh

Build analytical tables such as player features and rankings in the `mart` schema.

```bash
npm run mart:refresh
```

### 4. API

Start the backend API.

```bash
npm start
```

### 5. Full pipeline

Run the full backend flow in one command.

```bash
npm run pipeline:refresh
```

## Setup

```bash
cp .env.example .env
docker compose up -d
npm install
npm run db:migrate
```

## API docs

Swagger UI:

- `http://localhost:3000/api/v1/docs`

## Main endpoints

- `GET /api/v1/health`
- `GET /api/v1/clubs`
- `GET /api/v1/lookups/positions`
- `GET /api/v1/players`
- `GET /api/v1/players/:id`
- `GET /api/v1/rankings`
- `GET /api/v1/shortlists`
- `GET /api/v1/players/:id/score-explanation`
- `GET /api/v1/players/:id/similar-alternatives`

## Verification

```bash
npm test
```

## Live deployment

### Frontend
- App: https://football-dss.vercel.app/

### Backend
- API base: https://football-dss.onrender.com/api/v1
- Swagger docs: https://football-dss.onrender.com/api/v1/docs

### Stack
- Frontend: Vercel
- Backend API: Render
- Database: Supabase Postgres

## Local vs deployed workflow

### Deployed usage
You can use the deployed app without running anything locally.

### Local development
Use local Docker Postgres for normal development, migrations, ETL iteration, and debugging.
Use Supabase/Render/Vercel as the deployed environment, not as the default day-to-day dev loop.
