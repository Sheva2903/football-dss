# Football DSS Backend

Express + Postgres backend for a football DSS.

Reference DSS: [dw-football-dss](https://github.com/Sheva2903/dw-football-dss) — legacy domain/logic reference only; this backend is self-contained.

## Requirements

- Node.js 22+
- Docker Compose
- Postgres 16

## Setup

1. Copy env:
   ```bash
   cp .env.example .env
   ```

2. Put the source CSVs in `data/source/`.
   - These files are local inputs and are ignored by git.

3. Start Postgres:
   ```bash
   docker compose up -d
   ```

4. Install deps:
   ```bash
   npm install
   ```

## Run flow

1. Run migrations:
   ```bash
   npm run db:migrate
   ```

2. Refresh warehouse data:
   ```bash
   npm run etl:warehouse
   ```

3. Build the mart:
   ```bash
   npm run mart:refresh
   ```

4. Start the API:
   ```bash
   npm start
   ```

5. Open Swagger:
   - `http://localhost:3000/api/v1/docs`

6. Run the verification suite:
   ```bash
   npm test
   ```

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

## Notes

- The backend is read-heavy.
- Scores and rankings come from the mart.
- Evidence window and reliability level are user-selectable with defaults.
- CSV inputs stay local in `data/source/` and should not be committed.
