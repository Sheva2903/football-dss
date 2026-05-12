# Phase 2 Guide — Domain Model + Query Basics

Phase 2 is about turning the Phase 1 skeleton into a real football recruitment backend.

Phase 1 proved:
- Express runs
- PostgreSQL runs
- app ↔ DB connection works
- simple schema/seed scripts work
- a basic endpoint works

Phase 2 asks different questions:
- What tables should exist?
- Which fields belong in which table?
- How do I query football data properly?
- How do query params become SQL?
- How do I return joined data through the API?

This guide is structured as:
- knowledge / theory
- full code
- code explanation
- common confusions

---

# Phase 2 outcome

By the end of Phase 2, you should be comfortable with:

- designing a small relational schema
- separating identity data from stats data
- using foreign keys
- writing filtered SQL queries
- writing joins
- building `GET /players/:id`
- building filtered `GET /players`
- building `GET /clubs`
- testing SQL in `psql` before moving it into Node

---

# Phase 2 scope

## In scope
- `clubs`, `players`, `player_stats`
- realistic seed data
- filtered reads
- joins
- lookup endpoints
- query param parsing
- SQL-first thinking

## Out of scope
- ML
- full ranking engine
- explanation text generation
- auth
- Sequelize-heavy abstraction
- large ETL workflows

---

# Folder/file targets for Phase 2

```text
src/
  app.js
  routes/
    players.js
    clubs.js

database/
  schema/
    002_phase2_schema.sql
  seeds/
    002_phase2_seed.sql

src/db/
  init.js
  seed.js
```

You may keep your Phase 1 files. This phase replaces the toy table/data with a better model.

---

# Step 1 — Redesign the schema

## Theory

A football backend should not keep everything in one flat `players` table.

You need at least three ideas:

### 1. Club
A player belongs to a club.
Club data is reusable.
Many players can point to one club.

### 2. Player
A player has identity-like data:
- name
- nationality
- age
- position
- market value
- current club

### 3. Player stats
Stats are measured output.
They are not the same kind of data as player identity.

Examples:
- goals
- assists
- minutes played
- tackles
- interceptions

This is the key Phase 2 modeling rule:

```text
player identity data != player performance data
```

## Why split it this way?

### Why a `clubs` table?
Because club is not just text forever.
This teaches:
- foreign keys
- joins
- less duplication

### Why a `player_stats` table?
Because stats are measured values, often tied to a season or evidence window.
Even in a simplified project, they should not be mixed carelessly into the identity table.

### Why not normalize everything harder?
Because too many tables will slow learning.
This phase should teach useful relational modeling, not database purity for its own sake.

---

## Code — `database/schema/002_phase2_schema.sql`

```sql
DROP TABLE IF EXISTS player_stats;
DROP TABLE IF EXISTS players;
DROP TABLE IF EXISTS clubs;

CREATE TABLE clubs (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  country TEXT NOT NULL,
  league_name TEXT NOT NULL
);

CREATE TABLE players (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  nationality TEXT NOT NULL,
  age INTEGER NOT NULL CHECK (age > 0),
  primary_position TEXT NOT NULL,
  market_value_eur NUMERIC(12, 2),
  club_id INTEGER NOT NULL REFERENCES clubs(id) ON DELETE RESTRICT
);

CREATE TABLE player_stats (
  id SERIAL PRIMARY KEY,
  player_id INTEGER NOT NULL UNIQUE REFERENCES players(id) ON DELETE CASCADE,
  season TEXT NOT NULL,
  minutes_played INTEGER NOT NULL DEFAULT 0 CHECK (minutes_played >= 0),
  appearances INTEGER NOT NULL DEFAULT 0 CHECK (appearances >= 0),
  goals INTEGER NOT NULL DEFAULT 0 CHECK (goals >= 0),
  assists INTEGER NOT NULL DEFAULT 0 CHECK (assists >= 0),
  progressive_passes INTEGER NOT NULL DEFAULT 0 CHECK (progressive_passes >= 0),
  tackles INTEGER NOT NULL DEFAULT 0 CHECK (tackles >= 0),
  interceptions INTEGER NOT NULL DEFAULT 0 CHECK (interceptions >= 0)
);
```

---

## Code explanation

### `DROP TABLE IF EXISTS ...`
Used here because you are still learning and reshaping the schema.
This gives you a clean reset.

Order matters:
- drop child tables first
- then parent tables

`player_stats` depends on `players`
`players` depends on `clubs`

If you drop in the wrong order, Postgres can block you.

### `clubs`

```sql
name TEXT NOT NULL UNIQUE
```

- `NOT NULL` means every club must have a name
- `UNIQUE` means two clubs cannot share the same exact name in this simple model

`country` and `league_name` are text for now.
That is a good compromise.

### `players`

```sql
club_id INTEGER NOT NULL REFERENCES clubs(id)
```

This is a foreign key.
It means:
- each player row points to one row in `clubs`
- the DB can enforce relational integrity

Why this matters:
- you cannot point to a club that does not exist
- joins now have a real meaning

```sql
age INTEGER NOT NULL CHECK (age > 0)
```

This is your first schema-level validation.
The DB itself refuses invalid ages.

### `player_stats`

```sql
player_id INTEGER NOT NULL UNIQUE REFERENCES players(id)
```

`UNIQUE` here means one stats row per player in this simplified Phase 2 model.
That keeps the schema easy to reason about.

Later, if you want multiple seasons per player, you would remove that uniqueness and make the design season-aware.

```sql
ON DELETE CASCADE
```

If a player is deleted, their stats row is deleted automatically.
This prevents orphan stats rows.

### `CHECK (...)`
These keep negative nonsense values out of the DB.
Useful rule:
- application validation is helpful
- DB constraints are still important

---

## Common confusions

### “Why not keep `club` as text in players?”
Because repeated text loses relational structure.
You want to learn joins and foreign keys here.

### “Why does `player_stats.player_id` have `UNIQUE`?”
Because this guide uses one stats row per player for simplicity.
That keeps queries easier in Phase 2.

### “Why not make `position` a separate table?”
Because it adds complexity without much learning value yet.
`primary_position` as text is enough.

### “Why use `NUMERIC(12, 2)` for market value?”
Because money-like values should not use floating-point carelessly.
`NUMERIC` preserves decimal precision better.

---

# Step 2 — Seed meaningful data

## Theory

Phase 1 data only needed to prove the app worked.
Phase 2 data must be varied enough to make filters and joins useful.

You need variety in:
- club
- league
- position
- age
- market value
- stats profile

If all rows look similar, your queries will teach very little.

---

## Code — `database/seeds/002_phase2_seed.sql`

```sql
INSERT INTO clubs (name, country, league_name)
VALUES
  ('Arsenal', 'England', 'Premier League'),
  ('Bayern Munich', 'Germany', 'Bundesliga'),
  ('Real Madrid', 'Spain', 'La Liga'),
  ('Benfica', 'Portugal', 'Primeira Liga');

INSERT INTO players (name, nationality, age, primary_position, market_value_eur, club_id)
VALUES
  ('Bukayo Saka', 'England', 22, 'RW', 120000000.00, 1),
  ('William Saliba', 'France', 23, 'CB', 80000000.00, 1),
  ('Jamal Musiala', 'Germany', 21, 'AM', 110000000.00, 2),
  ('Rodrygo', 'Brazil', 23, 'RW', 100000000.00, 3),
  ('Joao Neves', 'Portugal', 19, 'CM', 55000000.00, 4);

INSERT INTO player_stats (
  player_id,
  season,
  minutes_played,
  appearances,
  goals,
  assists,
  progressive_passes,
  tackles,
  interceptions
)
VALUES
  (1, '2024/25', 2800, 34, 14, 10, 120, 28, 12),
  (2, '2024/25', 3000, 36, 3, 1, 65, 62, 40),
  (3, '2024/25', 2500, 31, 12, 8, 140, 22, 10),
  (4, '2024/25', 2400, 32, 13, 7, 95, 18, 8),
  (5, '2024/25', 2200, 30, 4, 6, 155, 55, 32);
```

---

## Code explanation

### Why insert clubs first?
Because `players.club_id` depends on `clubs.id`.
Parent rows must exist before child rows reference them.

### Why insert players second?
Because `player_stats.player_id` depends on `players.id`.

This gives the insertion order:

```text
clubs -> players -> player_stats
```

### Why keep only 4 clubs and 5 players?
Because the point is not big data yet.
The point is enough diversity to practice SQL and API logic.

### Why these stat columns?
They support useful Phase 2 queries:
- attacking output: goals, assists
- possession/progression: progressive_passes
- defensive output: tackles, interceptions
- minimum involvement: minutes_played, appearances

---

## Common confusions

### “Should I import real CSV now?”
Only if you trim it to what you need.
A small intentional dataset is better than a noisy large one.

### “Why hardcode IDs like club_id = 1?”
Because for a small seed file in a fresh reset schema, this is okay.
Later you may want more robust seed strategies.

### “Why one stats row per player?”
Because it keeps joins and API design simpler in this phase.

---

# Step 3 — Update schema/seed scripts to use the new files

## Theory

Your Node scripts should point to the new schema and seed files.
This keeps DB setup repeatable.

---

## Code — `src/db/init.js`

```js
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import pool from "./pool.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const schemaPath = path.resolve(__dirname, "../../database/schema/002_phase2_schema.sql");

try {
  const sql = await fs.readFile(schemaPath, "utf-8");
  await pool.query(sql);
  console.log("Phase 2 schema created successfully.");
} catch (error) {
  console.error("Failed to create schema:", error.message);
} finally {
  await pool.end();
}
```

## Code — `src/db/seed.js`

```js
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import pool from "./pool.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const seedPath = path.resolve(__dirname, "../../database/seeds/002_phase2_seed.sql");

try {
  const sql = await fs.readFile(seedPath, "utf-8");
  await pool.query(sql);
  console.log("Phase 2 seed data inserted successfully.");
} catch (error) {
  console.error("Failed to seed data:", error.message);
} finally {
  await pool.end();
}
```

---

## Code explanation

These files are almost the same as Phase 1.
The important change is which SQL file they read.

### Why keep SQL in `.sql` files instead of big JS strings?
Because:
- SQL stays readable
- schema lives with schema
- seed data lives with seed data
- easier to inspect and rerun manually

### Why `pool.end()` in scripts?
Because these are one-off scripts, not a long-running server.
Without closing the pool, the script can hang.

---

# Step 4 — Practice SQL in terminal first

## Theory

Before coding routes, learn the queries directly in `psql`.
This is a very strong backend habit.

Workflow:

```text
1. write query in psql
2. verify result
3. move query into Node
4. expose through API
```

---

## Useful terminal commands

Open psql:

```bash
docker exec -it football-dss-postgres psql -U postgres -d football_dss
```

Then practice:

```sql
\dt
```

```sql
\d clubs
```

```sql
\d players
```

```sql
\d player_stats
```

```sql
SELECT p.id, p.name, p.primary_position, p.age, c.name AS club_name
FROM players p
JOIN clubs c ON c.id = p.club_id
ORDER BY p.id;
```

```sql
SELECT p.name, s.goals, s.assists
FROM players p
JOIN player_stats s ON s.player_id = p.id
ORDER BY s.goals DESC;
```

```sql
SELECT p.name, p.age, p.primary_position
FROM players p
WHERE p.primary_position = 'RW'
  AND p.age <= 23
ORDER BY p.market_value_eur DESC;
```

---

## Query explanation

### Table aliases

```sql
players p
clubs c
player_stats s
```

Aliases shorten the query and make joins easier to read.

### `JOIN`

```sql
JOIN clubs c ON c.id = p.club_id
```

This means:
- find the related club row for each player
- match using the foreign key relationship

### `AS club_name`
This renames the selected output column.
Useful when two tables both have a `name` column.

### `WHERE`
Filters rows.
This is the start of real backend querying.

---

## Common confusions

### “Why test in psql first?”
Because SQL errors are easier to reason about there than buried inside app code.

### “What is `p` in `players p`?”
An alias. Short for the table name in that query.

### “Why not always use `SELECT *`?”
Because explicit column selection is clearer and safer.
It shows what your API really needs.

---

# Step 5 — Add `GET /players/:id`

## Theory

This teaches:
- path params
- one-resource lookup
- parameterized SQL
- 404 handling

This is one of the most basic backend patterns.

---

## Code — `src/routes/players.js`

```js
import express from "express";
import pool from "../db/pool.js";

const router = express.Router();

router.get("/:id", async (req, res) => {
  const playerId = Number(req.params.id);

  if (!Number.isInteger(playerId) || playerId <= 0) {
    return res.status(400).json({ message: "Invalid player id" });
  }

  try {
    const result = await pool.query(
      `
      SELECT
        p.id,
        p.name,
        p.nationality,
        p.age,
        p.primary_position,
        p.market_value_eur,
        c.id AS club_id,
        c.name AS club_name,
        c.country AS club_country,
        c.league_name,
        s.season,
        s.minutes_played,
        s.appearances,
        s.goals,
        s.assists,
        s.progressive_passes,
        s.tackles,
        s.interceptions
      FROM players p
      JOIN clubs c ON c.id = p.club_id
      JOIN player_stats s ON s.player_id = p.id
      WHERE p.id = $1
      `,
      [playerId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Player not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch player",
      error: error.message,
    });
  }
});

export default router;
```

---

## Code explanation

### `req.params.id`
This comes from the URL path.
For `/players/3`, `req.params.id` is the string `"3"`.

### `Number(req.params.id)`
You convert the string to a number.
Always be explicit. Do not assume types.

### Validation

```js
if (!Number.isInteger(playerId) || playerId <= 0)
```

This catches bad input early.
You do not want nonsense IDs flowing into the DB layer.

### Parameterized SQL

```sql
WHERE p.id = $1
```

with:

```js
[playerId]
```

This is how `pg` safely binds values.
You should not manually concatenate user input into SQL strings.

### `result.rows[0]`
For an ID lookup, you expect at most one row.
So return the first row directly.

---

## Common confusions

### “Why not use `parseInt`?”
You can. `Number(...)` is fine here because you still validate the result.

### “Why `$1` instead of putting the number directly in the string?”
Because parameterized queries are safer and cleaner.
This protects against SQL injection and keeps SQL structure separate from values.

### “Why return 404 instead of empty object?”
Because the resource does not exist.
That is what 404 means.

---

# Step 6 — Add filtered `GET /players`

## Theory

This is the most important Phase 2 API step.

The endpoint should support useful recruitment filters such as:
- position
- max age
- min/max market value
- club
- minimum minutes played

This teaches:
- query params
- number parsing
- optional conditions
- dynamic SQL building

---

## Code — append this to `src/routes/players.js` above the `/:id` route

```js
router.get("/", async (req, res) => {
  const { position, maxAge, minMarketValue, maxMarketValue, clubId, minMinutesPlayed } = req.query;

  const conditions = [];
  const values = [];

  if (position) {
    values.push(position);
    conditions.push(`p.primary_position = $${values.length}`);
  }

  if (maxAge) {
    const parsedMaxAge = Number(maxAge);

    if (!Number.isFinite(parsedMaxAge)) {
      return res.status(400).json({ message: "maxAge must be a number" });
    }

    values.push(parsedMaxAge);
    conditions.push(`p.age <= $${values.length}`);
  }

  if (minMarketValue) {
    const parsedMinMarketValue = Number(minMarketValue);

    if (!Number.isFinite(parsedMinMarketValue)) {
      return res.status(400).json({ message: "minMarketValue must be a number" });
    }

    values.push(parsedMinMarketValue);
    conditions.push(`p.market_value_eur >= $${values.length}`);
  }

  if (maxMarketValue) {
    const parsedMaxMarketValue = Number(maxMarketValue);

    if (!Number.isFinite(parsedMaxMarketValue)) {
      return res.status(400).json({ message: "maxMarketValue must be a number" });
    }

    values.push(parsedMaxMarketValue);
    conditions.push(`p.market_value_eur <= $${values.length}`);
  }

  if (clubId) {
    const parsedClubId = Number(clubId);

    if (!Number.isInteger(parsedClubId) || parsedClubId <= 0) {
      return res.status(400).json({ message: "clubId must be a positive integer" });
    }

    values.push(parsedClubId);
    conditions.push(`p.club_id = $${values.length}`);
  }

  if (minMinutesPlayed) {
    const parsedMinMinutesPlayed = Number(minMinutesPlayed);

    if (!Number.isFinite(parsedMinMinutesPlayed)) {
      return res.status(400).json({ message: "minMinutesPlayed must be a number" });
    }

    values.push(parsedMinMinutesPlayed);
    conditions.push(`s.minutes_played >= $${values.length}`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  try {
    const result = await pool.query(
      `
      SELECT
        p.id,
        p.name,
        p.nationality,
        p.age,
        p.primary_position,
        p.market_value_eur,
        c.id AS club_id,
        c.name AS club_name,
        c.country AS club_country,
        c.league_name,
        s.season,
        s.minutes_played,
        s.appearances,
        s.goals,
        s.assists,
        s.progressive_passes,
        s.tackles,
        s.interceptions
      FROM players p
      JOIN clubs c ON c.id = p.club_id
      JOIN player_stats s ON s.player_id = p.id
      ${whereClause}
      ORDER BY p.market_value_eur DESC, p.id ASC
      `,
      values
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch players",
      error: error.message,
    });
  }
});
```

---

## Code explanation

### Why build `conditions` and `values` arrays?
Because filters are optional.
You do not know ahead of time which ones the client will send.

So you build SQL step by step.

### Why use `$${values.length}`?
Because each pushed value needs the correct parameter placeholder.

Example:
- first filter value uses `$1`
- second uses `$2`
- third uses `$3`

This keeps SQL and values aligned.

### Why validate each query param?
Because `req.query` values are strings from the outside world.
Treat them as untrusted input.

### Why join `player_stats` even for list queries?
Because one of the filters (`minMinutesPlayed`) depends on stats.
Also, returning joined data makes the endpoint more useful.

### Why put `/` route above `/:id` route?
Because route ordering matters in Express.
If `/:id` comes first, it may catch paths you intended for `/`.

---

## Common confusions

### “Why not fetch all players and filter in JS?”
Because the database is built for filtering.
Pulling everything into Node first is less efficient and less correct as the app grows.

### “Why does `maxAge` come in as a string?”
Because HTTP query params are text.
This is normal.
You must parse them.

### “Why not just write one huge static SQL query?”
Because optional filters require dynamic conditions.

### “Why not use string interpolation in SQL?”
Because raw string interpolation with user input is unsafe.
Use parameter binding.

---

# Step 7 — Add `GET /clubs`

## Theory

A backend often needs lookup endpoints.
Not every endpoint is deep business logic.
Some exist to support dropdowns, filters, and client-side selection UIs.

---

## Code — `src/routes/clubs.js`

```js
import express from "express";
import pool from "../db/pool.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT id, name, country, league_name
      FROM clubs
      ORDER BY name ASC
      `
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch clubs",
      error: error.message,
    });
  }
});

export default router;
```

---

## Code explanation

This is intentionally simple.
That is the point.

### Why `ORDER BY name ASC`?
Because lookup lists are more useful when predictably ordered.

### Why not add filters here too?
Because you do not need them yet.
A good backend keeps endpoints as simple as the current use case allows.

---

# Step 8 — Mount the new routes

## Theory

Your route files do nothing unless the app mounts them.
This is the step that connects route modules into the Express app.

---

## Code — `src/app.js`

```js
import express from "express";
import pool from "./db/pool.js";
import playersRouter from "./routes/players.js";
import clubsRouter from "./routes/clubs.js";

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
app.use("/clubs", clubsRouter);

export default app;
```

---

## Code explanation

### `app.use("/players", playersRouter)`
This mounts the players router under `/players`.

That means:
- router path `/` becomes `GET /players`
- router path `/:id` becomes `GET /players/:id`

### `app.use("/clubs", clubsRouter)`
Same idea for clubs.

This is one of the cleanest Express mental models to learn early:

```text
mount path + router path = final endpoint path
```

---

# Step 9 — Verification flow

Run this sequence:

## Recreate schema

```bash
npm run db:init
```

## Seed data

```bash
npm run db:seed
```

## Start app

```bash
npm run dev
```

## Test endpoints

### Health
```bash
curl http://localhost:3000/health
```

### Clubs
```bash
curl http://localhost:3000/clubs
```

### All players
```bash
curl http://localhost:3000/players
```

### Player by ID
```bash
curl http://localhost:3000/players/1
```

### Filter by position
```bash
curl "http://localhost:3000/players?position=RW"
```

### Filter by age
```bash
curl "http://localhost:3000/players?maxAge=22"
```

### Filter by club and minutes
```bash
curl "http://localhost:3000/players?clubId=1&minMinutesPlayed=2500"
```

---

# What you should understand deeply after Phase 2

## Schema knowledge
- why `clubs`, `players`, and `player_stats` are separate
- what foreign keys mean
- why stats are not identity data

## SQL knowledge
- how filters become `WHERE`
- how joins combine related rows
- how sort order affects output
- why parameterized SQL matters

## API knowledge
- difference between path params and query params
- how route mounting works
- how one SQL query becomes one API response

## Backend workflow knowledge
- why testing queries in `psql` first is useful
- why the DB should do data filtering work
- why small clean route modules are easier to reason about

---

# Common Phase 2 mistakes

## 1. Filtering in Node instead of SQL
Bad habit.
Let the DB do filtering.

## 2. Concatenating raw user input into SQL
Unsafe and sloppy.
Use parameterized queries.

## 3. Over-normalizing too early
Too many tables can make the project harder to understand.

## 4. Importing too much old DSS data too early
Only bring what this phase needs.

## 5. Mixing identity fields and stats fields carelessly
That makes the schema harder to reason about later.

---

# Phase 2 completion checklist

- [ ] schema has `clubs`, `players`, and `player_stats`
- [ ] seed data is realistic enough for useful filters
- [ ] you can test joins in `psql`
- [ ] `GET /players/:id` works
- [ ] filtered `GET /players` works
- [ ] `GET /clubs` works
- [ ] you understand why the code is written this way

That is a real Phase 2.
