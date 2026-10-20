CREATE TABLE exercise_list_removals (
  exercise_id TEXT PRIMARY KEY REFERENCES exercises(id),
  removed_at TEXT NOT NULL
);
