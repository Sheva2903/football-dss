# Football DSS Backend Build Plan

## 1. What the research says

### Current repo state
The current Express project is still a learning scaffold:
- `src/app.js`
- `src/routes/player.js`
- `src/routes/clubs.js`
- `database/schema/002_phase2_schema.sql`

It currently uses a toy schema:
- `clubs`
- `players`
- `player_stats`

That schema does **not** match the real DSS domain, so the backend should be rebuilt around the DSS model instead of evolving the toy tables.

### Reference DSS state
The old DSS already contains the real backend domain and business logic:
- `../dw/src/etl.py` — warehouse ETL from CSVs
- `../dw/src/build_mart.py` — mart build and DSS score logic
- `../dw/src/evidence_windows.py` — evidence window and reliability settings
- `../dw/src/similar_player_recommender.py` — similar cheaper alternatives
- `../dw/README.md` — end-to-end run flow

Key reference data assets:
- `players.csv`
- `appearances.csv`
- `games.csv`
- `clubs.csv`
- `competitions.csv`
- `player_valuations.csv`
- `transfers.csv`
- other related football CSVs under `../dw/data/`

## 2. Decisions locked in

These were resolved during the grilling session.

- One repo owns the **full pipeline**: CSV -> warehouse -> mart -> API
- Old DSS is a **reference**, not something to copy as-is
- Use a **hybrid** data approach:
  - Sequelize for migrations, connection management, and simple access where useful
  - raw SQL for ETL, mart build, ranking, and analytics
- Backend is **read-heavy** for MVP
- Core ranking is **precomputed** in mart tables
- Preserve layered flow:
  - source CSVs
  - `warehouse.*`
  - `mart.*`
  - API
- Stay in **JavaScript** for now
- Use **pragmatic analytical endpoints**, not CRUD purity
- ETL and mart refresh run as **manual scripts** first
- Reproduce existing DSS scoring logic **closely first**
- Include recommender in MVP, but **build it last**
- Use **Zod** for env and request validation
- Use **proper migrations**, not `sync()`
- Add **small, selective integration tests** only
- Include a small modern production set:
  - Docker Compose
  - Sequelize migrations
  - Zod
  - Swagger/OpenAPI
  - structured logging
- **No auth** in v1
- Stay **close to reference schema** first
- Recommender logic should live in the **Node service layer**
- ETL should be **database-driven**, with Node orchestrating
- Use **direct CSV -> warehouse** for v1, no staging schema yet
- Use API versioning from start: **`/api/v1`**
- Do a **controlled reset** of the backend design
- **Reuse the current Postgres container setup** in `docker-compose.yaml`
- Use **bulk-oriented import**, not row-by-row ORM inserts
- Keep SQL files **first-class artifacts** in the repo
- Use Sequelize models **selectively only**
- Serve **Swagger/OpenAPI** in v1
- Use **feature-oriented API structure**, with separate pipeline folders
- **Copy required CSV datasets into this repo**
- Backend should be **generic**, not Barcelona-specific
- Primary responses should include **explanation-friendly fields**
- `evidenceWindow` and `reliabilityLevel` should be **user-selectable with defaults**

## 3. Recommended target architecture

### High-level flow
1. CSV files live in this repo under `data/source/`
2. Node scripts orchestrate ETL
3. Postgres stores normalized warehouse tables under `warehouse`
4. Raw SQL builds analytical mart tables under `mart`
5. Express API reads mostly from `mart.player_ranking` and related read queries
6. Recommendation service loads prepared player features and computes similar alternatives in Node

### Why this is the right shape
This matches the strongest parts of the old DSS while letting this repo become a real backend project focused on:
- SQL
- database design
- ETL
- migrations
- validation
- service boundaries
- API design
- explainability

## 4. Recommended repo structure

```text
src/
  app.js
  server.js
  config/
    env.js
    logger.js
    swagger.js
  db/
    sequelize.js
    query.js
  middleware/
    error-handler.js
    not-found.js
    validate.js
  modules/
    players/
      players.routes.js
      players.controller.js
      players.service.js
      players.repository.js
      players.schemas.js
    rankings/
      rankings.routes.js
      rankings.controller.js
      rankings.service.js
      rankings.repository.js
      rankings.schemas.js
    recommendations/
      recommendations.routes.js
      recommendations.controller.js
      recommendations.service.js
      recommendations.repository.js
      recommendations.schemas.js
    lookups/
      lookups.routes.js
      lookups.controller.js
      lookups.service.js
      lookups.repository.js
  shared/
    constants/
      evidence-windows.js
      reliability-levels.js
    utils/

scripts/
  etl/
    load-dimensions.js
    load-facts.js
    refresh-warehouse.js
  mart/
    build-player-features.js
    build-player-ranking.js
    refresh-mart.js
  pipeline/
    refresh-all.js

config/
  swagger/

database/
  migrations/
  sql/
    warehouse/
    mart/
    queries/

data/
  source/
  processed/

tests/
  integration/
```

## 5. Database design

### Keep using current container infrastructure
Keep `docker-compose.yaml` and the single Postgres service:
- image: `postgres:16`
- container: `football-dss-postgres`

But reset the database contents because the current toy schema is not the real domain.

### Warehouse schema
Rebuild around the reference DSS warehouse model.

Recommended v1 warehouse tables:
- `warehouse.dim_date`
- `warehouse.dim_competitions`
- `warehouse.dim_clubs`
- `warehouse.dim_players`
- `warehouse.fact_matches`
- `warehouse.fact_player_performance`
- `warehouse.fact_player_valuations`

These are directly supported by the reference `etl.py` flow.

### Mart schema
Rebuild these first-class analytical tables:
- `mart.player_features`
- `mart.player_ranking`

These should stay explicit in SQL files because they are the heart of the DSS.

## 6. Scoring and evidence logic to preserve first

Port the existing DSS logic closely before redesigning anything.

### Evidence windows
From `evidence_windows.py`:
- `last_season`
- `last_3_seasons`
- `last_5_seasons`

Defaults:
- `evidenceWindow=last_3_seasons`
- `reliabilityLevel=Medium`

### Reliability thresholds
Preserve these first:
- `last_season`: 300 / 900 / 1800
- `last_3_seasons`: 900 / 1800 / 3600
- `last_5_seasons`: 1500 / 3000 / 6000

### Ranking eligibility filters
Preserve reference-style filters first:
- minimum appearances
- minimum minutes
- recent valuation availability
- non-null market value
- non-goalkeeper filtering
- non-null attacking contribution / position checks

### Score components
Preserve these score parts from the reference mart:
- `production_score`
- `value_score`
- `discipline_score`
- window-specific reliability scores
- window-specific smart value indexes
- `final_dss_score`

### Final DSS score
Preserve this formula first:
- `0.40 * production_score`
- `0.35 * value_score`
- `0.20 * reliability_score_last_3_seasons`
- `0.05 * discipline_score`

## 7. Recommender strategy

Keep the recommender in Node service code, not buried in SQL.

### How to explain it simply
The recommender is not “mysterious AI”. For v1, explain it as:
1. Build a feature profile for each player
2. Find players most similar to the target player
3. Filter to realistic alternatives
4. Rank those alternatives by similarity, affordability, and value

### Preserve these reference ideas first
Features used in the old DSS include:
- age
- appearances
- total minutes
- minutes per appearance
- recent minutes
- recent appearances
- goals
- assists
- goal contributions
- attacking contribution per 90
- discipline risk per 90
- production score
- reliability score
- discipline score
- smart value index
- position

Reference-style business filters:
- exclude the target player
- optionally same position only
- must be cheaper than target
- optional budget cap
- minimum recent minutes threshold
- age range
- minimum similarity threshold

Reference-style output scores:
- `similarity_score`
- `affordability_score`
- `alternative_score = 0.55 * similarity + 0.25 * affordability + 0.20 * smart_value_index`

### Learning goal for this part
Implement it in a way that you can explain to another person step by step, without needing deep ML theory.

## 8. API design

Use ` /api/v1 ` from the start.

### Core endpoints for MVP
- `GET /api/v1/health`
- `GET /api/v1/players`
- `GET /api/v1/players/:id`
- `GET /api/v1/clubs`
- `GET /api/v1/lookups/positions`
- `GET /api/v1/rankings`
- `GET /api/v1/shortlists`
- `GET /api/v1/players/:id/score-explanation`
- `GET /api/v1/players/:id/similar-alternatives`

### Query/filter examples
#### `GET /api/v1/players`
Possible filters:
- `position`
- `minAge`
- `maxAge`
- `clubId`
- `minMarketValue`
- `maxMarketValue`
- `evidenceWindow`
- `reliabilityLevel`
- pagination/sort params

#### `GET /api/v1/rankings`
Possible filters:
- `position`
- `minAge`
- `maxAge`
- `maxBudget`
- `evidenceWindow`
- `reliabilityLevel`
- `limit`
- `sortBy`

#### `GET /api/v1/shortlists`
Could be a filtered ranking endpoint or a small explicit shortlist endpoint.
Recommended v1: keep it as a use-case endpoint around ranking filters.

#### `GET /api/v1/players/:id/score-explanation`
Return:
- base player identity fields
- main score columns
- recent window columns
- text-friendly breakdown of how the score is formed

#### `GET /api/v1/players/:id/similar-alternatives`
Return:
- target player summary
- candidate list
- similarity score
- affordability score
- alternative score
- reason/explanation-friendly fields

## 9. Validation, logging, and docs

### Validation
Use Zod for:
- environment config
- query string validation
- path params
- any future request bodies

This will replace repetitive manual validation currently in routes like `src/routes/player.js`.

### Logging
Use structured logging from the start.
Recommended: `pino`

Log:
- app startup
- ETL start/end
- mart build start/end
- errors
- recommendation runs where useful

### API docs
Serve Swagger/OpenAPI in the app from v1.
This is especially useful because many endpoints will have many filter params.

## 10. Migrations and SQL artifact policy

### Migrations
Use Sequelize migrations for:
- schema creation
- schema evolution
- indexes
- constraints

Do not use `sequelize.sync()`.

### SQL files
Keep raw SQL files visible for:
- warehouse helper queries where useful
- mart build SQL
- read queries that are easier to reason about in SQL

Suggested structure:
- `database/sql/warehouse/`
- `database/sql/mart/`
- `database/sql/queries/`

## 11. Import strategy

### Data location
Copy required CSVs from the old DSS into this repo under `data/source/`.
The new backend should not depend on the old repo path at runtime.

### Import style
Use bulk-oriented import patterns.
Avoid row-by-row ORM inserts for large football datasets.

### Practical v1 approach
Node script should:
1. validate file paths and config
2. open transaction boundaries where appropriate
3. call SQL-based load/transform operations
4. log counts and completion

## 12. Testing strategy

Keep testing small and high value.

### Recommended v1 tests
- a few integration tests for:
  - `GET /api/v1/players`
  - `GET /api/v1/rankings`
  - `GET /api/v1/players/:id/score-explanation`
  - `GET /api/v1/players/:id/similar-alternatives`
- one or two pipeline verification tests or script checks

### Do not overdo for v1
This project should not become a testing exercise. Test the risky backbone only.

## 13. Concrete implementation phases

### Phase 1 — Reset foundation
Goal: remove toy-domain assumptions and set up real backend foundation.

Tasks:
1. keep current repo and current Postgres compose setup
2. remove/retire toy schema usage from:
   - `database/schema/002_phase2_schema.sql`
   - `src/routes/player.js`
   - `src/routes/clubs.js`
3. add foundational packages:
   - `sequelize`
   - `sequelize-cli`
   - `zod`
   - `pino`
   - Swagger packages
   - test packages
4. set up base app structure
5. validate env with Zod
6. add centralized error handling

Verification:
- app boots
- `/api/v1/health` works
- DB connection works

### Phase 2 — Warehouse schema and migrations
Goal: create the real database shape.

Tasks:
1. add Sequelize config and migration setup
2. create `warehouse` schema
3. create warehouse dimension/fact tables close to reference DSS
4. add indexes needed for ETL and read queries

Verification:
- migrations run cleanly from empty DB
- tables exist under `warehouse`

### Phase 3 — Data import pipeline
Goal: load football CSV data into warehouse.

Tasks:
1. copy needed CSVs into `data/source/`
2. implement ETL scripts
3. import dimensions
4. import match/performance/valuation facts
5. log row counts and failures clearly

Verification:
- warehouse row counts are non-zero
- spot-check key tables
- pipeline can rerun from clean DB

### Phase 4 — Mart build
Goal: rebuild reference DSS analytical read model.

Tasks:
1. port `player_features` SQL into repo SQL files
2. port `player_ranking` SQL into repo SQL files
3. preserve evidence windows and score formulas first
4. add mart refresh scripts

Verification:
- `mart.player_features` exists and has one row per player expectation
- `mart.player_ranking` exists and sorts by `final_dss_score`
- output shape matches expectations from reference repo

### Phase 5 — Lookup and player APIs
Goal: expose basic read APIs.

Tasks:
1. build clubs/positions lookup endpoints
2. build player list/detail endpoints
3. validate filters with Zod
4. document endpoints in Swagger

Verification:
- endpoints return stable JSON
- invalid queries return 400 with useful errors

### Phase 6 — Rankings and shortlist APIs
Goal: expose core DSS read functionality.

Tasks:
1. build rankings endpoint over mart queries
2. build shortlist endpoint/use-case wrapper
3. expose evidence window and reliability level as filters with defaults
4. include explanation-friendly columns in response

Verification:
- filters work
- default evidence settings work
- returned rows contain score columns

### Phase 7 — Score explanation API
Goal: make the DSS explainable.

Tasks:
1. build `GET /players/:id/score-explanation`
2. include the component scores and recent evidence context
3. add clear textual explanation fields if helpful

Verification:
- one player can be explained clearly from API response alone

### Phase 8 — Similar alternatives API
Goal: add the final recommender capability.

Tasks:
1. load candidate pool from mart data
2. implement similarity pipeline in Node
3. preserve old business filters
4. compute similarity, affordability, and alternative scores
5. document how the algorithm works

Verification:
- endpoint returns plausible cheaper alternatives
- output is explainable for one sample player

### Phase 9 — Small integration test pass and cleanup
Goal: stabilize the MVP.

Tasks:
1. add a few high-value integration tests
2. verify scripts and docs
3. clean temporary code
4. tighten README run flow

Verification:
- core endpoints tested
- pipeline run steps documented
- Swagger usable

## 14. Suggested npm scripts

Recommended direction:

```json
{
  "scripts": {
    "dev": "nodemon src/server.js",
    "start": "node src/server.js",
    "db:migrate": "sequelize-cli db:migrate",
    "db:migrate:undo": "sequelize-cli db:migrate:undo",
    "etl:warehouse": "node scripts/etl/refresh-warehouse.js",
    "mart:build": "node scripts/mart/refresh-mart.js",
    "pipeline:refresh": "node scripts/pipeline/refresh-all.js",
    "test": "vitest run"
  }
}
```

## 15. What not to add in v1

Do not add these yet:
- auth
- user accounts
- saved scenarios
- background workers
- queues
- staging schema
- microservices
- GraphQL
- Kubernetes
- premature scoring redesign

## 16. Best first implementation order

If starting immediately, build in this order:
1. foundation reset
2. migrations for `warehouse.*`
3. copy CSVs into repo
4. ETL scripts
5. mart SQL build
6. `GET /rankings`
7. `GET /players` and `GET /players/:id`
8. `GET /players/:id/score-explanation`
9. recommender endpoint
10. Swagger + small integration tests

## 17. The single most important principle

Do **not** try to learn Express, Sequelize, ETL, SQL analytics, recommender logic, testing, and architecture by hiding complexity behind abstractions.

For this project, the clean path is:
- keep the analytical logic visible
- keep the SQL visible
- keep the API use-case-driven
- port the working DSS logic first
- redesign later only after the new backend is correct
