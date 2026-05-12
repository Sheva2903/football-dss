CREATE TABLE IF NOT EXISTS players (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  position TEXT NOT NULL,
  age INTEGER NOT NULL,
  club TEXT,
  nationality TEXT,
  market_value_euro NUMERIC(12, 2)
);