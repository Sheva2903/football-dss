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