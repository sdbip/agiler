CREATE TABLE IF NOT EXISTS Items(
	id TEXT PRIMARY KEY,
	type TEXT NOT NULL,
	progress TEXT NOT NULL,
	title TEXT NOT NULL,
	parent_id TEXT,
	assignee TEXT
);

CREATE TABLE IF NOT EXISTS Entities (
  id TEXT NOT NULL PRIMARY KEY,
  type TEXT NOT NULL,
  version INT NOT NULL
);

CREATE TABLE IF NOT EXISTS Events (
  entity_id TEXT NOT NULL REFERENCES Entities(id),
  entity_type TEXT NOT NULL,
  name TEXT NOT NULL,
  details TEXT NOT NULL,
  actor TEXT NOT NULL,
  timestamp DECIMAL(12,7) NOT NULL DEFAULT (EXTRACT(EPOCH FROM CURRENT_TIMESTAMP AT TIME ZONE 'UTC') / 86400),
  version INT NOT NULL,
  position BIGINT NOT NULL
);
