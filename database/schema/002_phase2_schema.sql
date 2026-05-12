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