# Phase 1 Guide — Backend Foundation (Express + PostgreSQL + Docker)

This phase is about building the minimum backend skeleton **the right way**, while understanding every moving part.

The goal is not to build the whole DSS yet.
The goal is to make the backend foundation feel normal.

---

# What Phase 1 covers

By the end of Phase 1, you should be comfortable with:

- Express project structure
- app vs server split
- environment variables
- Docker Compose basics
- PostgreSQL basics
- connecting Node to PostgreSQL
- writing simple SQL schema and seed data
- exposing DB data through a REST endpoint

---

# What Phase 1 does NOT cover

Do not put these into Phase 1:

- full DSS ranking logic
- full CSV migration
- ML
- complex ETL
- Sequelize
- auth
- advanced validation
- frontend

You can reuse DSS concepts and later reuse useful CSV/ETL outputs, but not yet.

---

# Should you move the DSS CSV files now?

Short answer: **no, not yet**.

For Phase 1:
- first use a tiny SQL seed with 3–10 players
- optionally later use one small sample CSV
- do not copy the whole data pipeline yet

Why:
- Phase 1 is about backend basics
- large CSV import will distract you into data cleaning/import issues too early

---

# Final target for Phase 1

At the end, your project should be able to do this:

1. Start PostgreSQL with Docker Compose
2. Start the Express server
3. Connect the app to PostgreSQL
4. Query a `players` table
5. Return players from `GET /players`

That is enough for Phase 1.

---

# Recommended folder structure for Phase 1

```text
football-dss/
├─ .env
├─ .env.example
├─ docker-compose.yml
├─ package.json
├─ src/
│  ├─ app.js
│  ├─ server.js
│  ├─ config/
│  │  └─ env.js
│  ├─ db/
│  │  ├─ pool.js
│  │  ├─ init.js
│  │  └─ seed.js
│  └─ routes/
│     └─ players.js
└─ database/
   ├─ schema/
   │  └─ 001_create_players.sql
   └─ seeds/
      └─ 001_seed_players.sql
```

This is intentionally simple.

---

# Phase 1 Step 1 — Clean Express structure

## Goal
Separate app definition from server startup.

Right now, your project has duplicated startup logic. That is the first thing to fix.

## Theory

### Why split `app.js` and `server.js`?

Because they have different responsibilities:

```text
app.js    = define the app
server.js = start the app
```

### `app.js` should do:
- create the Express app
- register middleware
- register routes
- export the app

### `server.js` should do:
- import the app
- read the port
- call `listen()`

This matters because later you may want to:
- test the app without starting the server
- keep startup logic separate from route logic
- reason about backend flow more clearly

## Code

### `src/app.js`
```js
import express from "express";

const app = express();

app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

export default app;
```

### Why write it like this?

#### `express()`
This creates the application instance.
Think of it as the main object that receives requests.

#### `app.use(express.json())`
This tells Express to automatically parse incoming JSON request bodies.
You want this early because almost every backend API needs JSON input.

#### `app.get("/health", ...)`
This defines a route.
- `GET` is the HTTP method
- `/health` is the path
- the callback is the handler

A health endpoint is useful because it gives you one very simple way to prove:
- the server is running
- routing works
- JSON responses work

#### `res.json(...)`
Use JSON instead of plain text because this is a backend API project.
That keeps the project aligned with REST-style responses from the start.

#### `export default app`
You export the app so `server.js` can start it.

---

### `src/server.js`
```js
import app from "./app.js";

const port = 3000;

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
```

### Why write it like this?

#### `import app from "./app.js"`
This imports the already-defined Express app.
`server.js` should not rebuild the app.
It only starts it.

#### `const port = 3000`
For now this is okay, but in the next step you will move it to environment config.

#### `app.listen(...)`
This starts the HTTP server and binds it to a port.
Without `listen()`, the app exists in memory but accepts no network traffic.

#### Template literal with backticks
Use:
```js
`Server listening on port ${port}`
```
not:
```js
'Server listening on port ${port}'
```

Because single quotes do not interpolate variables.

## Verify
Run:

```bash
npm run dev
```

Then test:

```bash
curl http://localhost:3000/health
```

Expected:

```json
{"status":"ok"}
```

---

# Phase 1 Step 2 — Add environment config

## Goal
Stop hardcoding runtime values like port and DB credentials.

## Theory

Backend apps always depend on external configuration:
- app port
- DB host
- DB port
- DB name
- DB user
- DB password

You do **not** want these scattered through code.

Use `.env` for local development.

### Why this matters now
Because in the next steps you will connect to Dockerized PostgreSQL, and the app needs a clean way to know how to connect.

## Install dependency

```bash
npm install dotenv pg
```

- `dotenv` loads variables from `.env`
- `pg` is the PostgreSQL driver for Node.js

## Code

### `.env`
```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=football_dss
DB_USER=postgres
DB_PASSWORD=postgres
```

### `.env.example`
```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=football_dss
DB_USER=postgres
DB_PASSWORD=postgres
```

### Why both files?

#### `.env`
Your real local config.

#### `.env.example`
A template for future setup.
It documents what variables are required.

---

### `src/config/env.js`
```js
import dotenv from "dotenv";

dotenv.config();

const env = {
  port: Number(process.env.PORT) || 3000,
  dbHost: process.env.DB_HOST || "localhost",
  dbPort: Number(process.env.DB_PORT) || 5432,
  dbName: process.env.DB_NAME || "football_dss",
  dbUser: process.env.DB_USER || "postgres",
  dbPassword: process.env.DB_PASSWORD || "postgres",
};

export default env;
```

### Why write it like this?

#### `dotenv.config()`
This loads values from `.env` into `process.env`.
Without it, Node does not automatically read `.env`.

#### `Number(...)`
Environment variables come in as strings.
Ports should be numbers when you use them as numeric config.

#### fallback defaults
These make local development more forgiving.
They are okay in a learning project.

---

### Update `src/server.js`
```js
import app from "./app.js";
import env from "./config/env.js";

app.listen(env.port, () => {
  console.log(`Server listening on port ${env.port}`);
});
```

### Why change it?
Because `server.js` should no longer own configuration values.
It should read from one central place.

## Verify
Run:

```bash
npm run dev
```

Then:

```bash
curl http://localhost:3000/health
```

You should still get the same response.

---

# Phase 1 Step 3 — Add Docker Compose for PostgreSQL

## Goal
Run a real PostgreSQL instance locally in a predictable way.

## Theory

### Why Docker here?
Because your app depends on PostgreSQL, and Docker gives you:
- consistent local setup
- easy restart/reset
- no need for messy machine-specific DB installs

### Key Docker concepts

#### image
Blueprint for the software.

#### container
Running instance of the image.

#### port mapping
Lets your laptop connect to the container.

#### volume
Persists DB data even if the container is stopped or recreated.

## Code

### `docker-compose.yml`
```yaml
services:
  postgres:
    image: postgres:16
    container_name: football-dss-postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: football_dss
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

## Why write it like this?

### `image: postgres:16`
Use the official PostgreSQL image.
Version pinning is better than using `latest` because it gives predictable behavior.

### `container_name`
Makes the container easier to identify.

### `restart: unless-stopped`
Useful in dev so the DB restarts automatically unless you explicitly stop it.

### `environment`
These variables initialize the PostgreSQL database/user/password.
They should match your `.env` app config.

### `ports`
```yaml
"5432:5432"
```
means:
- left side = host machine port
- right side = container port

### `volumes`
Without a volume, your DB data may disappear when the container is recreated.

## Verify
Start DB:

```bash
docker compose up -d
```

Check it:

```bash
docker compose ps
```

You should see the postgres service running.

---

# Phase 1 Step 4 — Add PostgreSQL connection from Node

## Goal
Make Express talk to PostgreSQL.

## Theory

At this stage, do **not** use Sequelize.
Use the raw `pg` driver first.

Why?
Because you want to deeply understand:
- what a DB connection is
- how SQL is executed
- what result rows look like
- how app and DB actually communicate

Use a connection pool rather than a single client.

### Why a pool?
A pool manages DB connections for you.
That is the normal production-style pattern, and it is still simple enough for learning.

## Code

### `src/db/pool.js`
```js
import pg from "pg";
import env from "../config/env.js";

const { Pool } = pg;

const pool = new Pool({
  host: env.dbHost,
  port: env.dbPort,
  database: env.dbName,
  user: env.dbUser,
  password: env.dbPassword,
});

export default pool;
```

## Why write it like this?

### `Pool`
This gives you a managed set of DB connections.
You do not manually open and close one connection for every request.

### Config from `env`
This keeps DB config in one place and avoids hardcoding DB details.

---

### Add a DB health route in `src/app.js`
Replace the file with this:

```js
import express from "express";
import pool from "./db/pool.js";

const app = express();

app.use(express.json());

app.get("/health", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW() AS now");

    res.json({
      status: "ok",
      database: "connected",
      now: result.rows[0].now,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      database: "disconnected",
      message: error.message,
    });
  }
});

export default app;
```

## Why change `/health` like this?

Because now `/health` does more than prove Express is alive.
It proves:
- route handling works
- async DB access works
- PostgreSQL is reachable
- SQL query execution works

### `await pool.query(...)`
This sends SQL to PostgreSQL.

### `result.rows`
This is how `pg` returns query results.
That is a key thing to become comfortable with.

### `try/catch`
DB calls can fail.
This is your first useful backend error boundary.

## Verify
Make sure Docker PostgreSQL is running, then run:

```bash
npm run dev
curl http://localhost:3000/health
```

Expected: JSON response showing DB connection and a timestamp.

---

# Phase 1 Step 5 — Create the first SQL schema

## Goal
Create one simple table: `players`.

## Theory

Do not model the whole DSS yet.
For Phase 1, one small table is enough.

This step is about learning:
- SQL table creation
- column types
- primary keys
- required vs optional fields

## Code

### `database/schema/001_create_players.sql`
```sql
CREATE TABLE IF NOT EXISTS players (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  position TEXT NOT NULL,
  age INTEGER NOT NULL,
  club TEXT,
  nationality TEXT,
  market_value_eur NUMERIC(12, 2)
);
```

## Why write it like this?

### `SERIAL PRIMARY KEY`
Gives each player an auto-incrementing unique ID.
That is enough for Phase 1.

### `TEXT`
Simple string type. Good enough here.

### `INTEGER`
Correct for `age`.

### `NUMERIC(12, 2)`
Useful for currency-like values because it preserves decimal precision better than float.

### `NOT NULL`
Use it on fields that should always exist in this early model.

---

# Phase 1 Step 6 — Add seed data

## Goal
Insert a few rows so the API has real data to return.

## Theory

At this stage, manual seed SQL is better than CSV import.
Why?
Because it keeps learning focused on SQL + backend flow.

## Code

### `database/seeds/001_seed_players.sql`
```sql
INSERT INTO players (name, position, age, club, nationality, market_value_eur)
VALUES
  ('Bukayo Saka', 'RW', 22, 'Arsenal', 'England', 120000000.00),
  ('Jamal Musiala', 'AM', 21, 'Bayern Munich', 'Germany', 110000000.00),
  ('William Saliba', 'CB', 23, 'Arsenal', 'France', 80000000.00),
  ('Rodrygo', 'RW', 23, 'Real Madrid', 'Brazil', 100000000.00),
  ('João Neves', 'CM', 19, 'Benfica', 'Portugal', 55000000.00);
```

## Why write it like this?

Because 5 rows are enough to:
- test DB reads
- inspect JSON output
- understand the full request → query → response loop

No need for more yet.

---

# Phase 1 Step 7 — Add DB init and seed scripts in Node

## Goal
Make schema creation and seeding repeatable from your app environment.

## Theory

Instead of copying SQL manually into psql every time, create tiny scripts that execute the SQL files.
This teaches:
- file-driven schema workflow
- repeatable local setup
- backend scripting basics

## Code

### `src/db/init.js`
```js
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import pool from "./pool.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const schemaPath = path.resolve(__dirname, "../../database/schema/001_create_players.sql");

try {
  const sql = await fs.readFile(schemaPath, "utf-8");
  await pool.query(sql);
  console.log("Schema created successfully.");
} catch (error) {
  console.error("Failed to create schema:", error.message);
} finally {
  await pool.end();
}
```

### Why write it like this?

#### `fs.readFile(...)`
Read the SQL from a real file instead of embedding large SQL strings in JS.
That keeps SQL and app logic separate.

#### `path.resolve(...)`
Makes the file path explicit and predictable.

#### `await pool.end()`
Important in one-off scripts.
It closes DB connections so the script exits cleanly.

---

### `src/db/seed.js`
```js
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import pool from "./pool.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const seedPath = path.resolve(__dirname, "../../database/seeds/001_seed_players.sql");

try {
  const sql = await fs.readFile(seedPath, "utf-8");
  await pool.query(sql);
  console.log("Seed data inserted successfully.");
} catch (error) {
  console.error("Failed to seed data:", error.message);
} finally {
  await pool.end();
}
```

### Why make a separate seed script?
Because schema creation and data insertion are different concerns.
That distinction matters in backend/database work.

---

### Update `package.json` scripts
```json
{
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js",
    "db:init": "node src/db/init.js",
    "db:seed": "node src/db/seed.js"
  }
}
```

## Why add these scripts?
Because backend projects need repeatable commands.
This lets you set up the DB without guessing.

## Verify
Run:

```bash
npm run db:init
npm run db:seed
```

Then inspect the DB later via an API route.

---

# Phase 1 Step 8 — Add `GET /players`

## Goal
Complete the full backend flow:

```text
HTTP request → Express route → SQL query → JSON response
```

## Theory

This is the first real API endpoint in the project.
Keep it small.
No services, repositories, DTOs, or heavy abstractions yet.

## Code

### `src/routes/players.js`
```js
import express from "express";
import pool from "../db/pool.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT id, name, position, age, club, nationality, market_value_eur
      FROM players
      ORDER BY id ASC
      `
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch players",
      error: error.message,
    });
  }
});

export default router;
```

## Why write it like this?

### `express.Router()`
This lets you group routes by feature.
Even in Phase 1, this is a good habit and still simple.

### `router.get("/")`
This means the route path will depend on where the router is mounted.
You will mount it at `/players`, so this becomes `GET /players`.

### `SELECT ... ORDER BY id ASC`
Explicit queries are good.
You should see exactly what is being returned.
That is part of learning the SQL-to-API relationship.

### `res.json(result.rows)`
Return the rows directly.
No need for a wrapped format yet.
Keep the flow transparent.

---

### Update `src/app.js`
```js
import express from "express";
import pool from "./db/pool.js";
import playersRouter from "./routes/players.js";

const app = express();

app.use(express.json());

app.get("/health", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW() AS now");

    res.json({
      status: "ok",
      database: "connected",
      now: result.rows[0].now,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      database: "disconnected",
      message: error.message,
    });
  }
});

app.use("/players", playersRouter);

export default app;
```

## Why mount the router like this?
Because it creates a clean URL boundary:

```text
/players
```

This is already the beginning of RESTful structure.

## Verify
Run:

```bash
npm run dev
curl http://localhost:3000/players
```

Expected: JSON array of seeded players.

---

# Phase 1 Step 9 — Full verification flow

Run this full sequence from scratch:

## 1. Start PostgreSQL
```bash
docker compose up -d
```

## 2. Create schema
```bash
npm run db:init
```

## 3. Seed data
```bash
npm run db:seed
```

## 4. Start app
```bash
npm run dev
```

## 5. Test health
```bash
curl http://localhost:3000/health
```

## 6. Test players
```bash
curl http://localhost:3000/players
```

If all of this works, Phase 1 is complete.

---

# What you should understand after Phase 1

You should be able to explain:

## Express
- what `express()` creates
- why `app.js` and `server.js` are separate
- what middleware is doing
- how routes return JSON

## Environment
- why `.env` exists
- how `dotenv` works
- why config should be centralized

## Docker
- what an image is
- what a container is
- why port mapping matters
- why DB volumes matter

## PostgreSQL
- what the `players` table represents
- why data types were chosen
- how inserts and selects work

## Integration
- how `pool.query(...)` sends SQL to PostgreSQL
- how query results become JSON API responses
- how the app and DB depend on each other

---

# What comes after Phase 1

Only after Phase 1 feels comfortable should you move to Phase 2.

Likely Phase 2 would be:
- richer football data model
- more realistic player fields
- filters
- query parameters
- shortlist-oriented SQL
- maybe selected reuse of DSS CSV/ETL outputs

Still no rush into Sequelize until raw SQL flow feels natural.

---

# Hands-on workflow recommendation

Use this exact order while coding:

1. rewrite `app.js` and `server.js`
2. add `.env` and `env.js`
3. install `dotenv` and `pg`
4. add `docker-compose.yml`
5. start PostgreSQL
6. add `pool.js`
7. upgrade `/health` to check DB
8. add schema SQL file
9. add seed SQL file
10. add `init.js` and `seed.js`
11. add `GET /players`
12. run full verification

---

# If something breaks, debug in this order

## If `/health` fails before DB work
Check:
- syntax errors
- import/export issues
- duplicated `listen()`

## If DB connection fails
Check:
- docker container is running
- `.env` values match docker-compose credentials
- port 5432 is exposed
- `pg` is installed

## If `/players` fails
Check:
- schema was created
- seed ran successfully
- route was mounted in `app.js`
- SQL table name matches exactly

---

# Phase 1 completion checklist

- [ ] Express structure is clean
- [ ] `/health` returns JSON
- [ ] env config is in place
- [ ] PostgreSQL runs in Docker
- [ ] Node connects to PostgreSQL
- [ ] `players` table exists
- [ ] seed data exists
- [ ] `GET /players` works
- [ ] you understand the flow end to end

That is a strong Phase 1.
