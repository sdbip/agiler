DROP TABLE IF EXISTS tasks;

CREATE TABLE tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  progress TEXT NOT NULL,
  assignee TEXT NULL
);
