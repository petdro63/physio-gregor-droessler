ALTER TABLE media RENAME TO media_previous;
CREATE TABLE media (id TEXT PRIMARY KEY, exercise_id TEXT NOT NULL REFERENCES exercises(id), kind TEXT NOT NULL CHECK(kind IN ('image','video','captions')), filename TEXT NOT NULL, mime TEXT NOT NULL, size INTEGER NOT NULL, original_name TEXT NOT NULL, created_at TEXT NOT NULL);
INSERT INTO media SELECT * FROM media_previous;
DROP TABLE media_previous;
