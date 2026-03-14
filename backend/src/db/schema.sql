-- Workflows
CREATE TABLE IF NOT EXISTS workflows (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  definition TEXT NOT NULL,
  enabled INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Executions (run history)
CREATE TABLE IF NOT EXISTS executions (
  id TEXT PRIMARY KEY,
  workflow_id TEXT NOT NULL,
  trigger_type TEXT NOT NULL,
  status TEXT NOT NULL,
  started_at TEXT DEFAULT (datetime('now')),
  finished_at TEXT,
  error_message TEXT,
  FOREIGN KEY (workflow_id) REFERENCES workflows(id)
);

-- Execution steps (log per step)
CREATE TABLE IF NOT EXISTS execution_steps (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  execution_id TEXT NOT NULL,
  node_id TEXT NOT NULL,
  step_index INTEGER NOT NULL,
  status TEXT NOT NULL,
  input_data TEXT,
  output_data TEXT,
  error_message TEXT,
  started_at TEXT DEFAULT (datetime('now')),
  finished_at TEXT,
  retry_count INTEGER DEFAULT 0,
  FOREIGN KEY (execution_id) REFERENCES executions(id)
);

CREATE INDEX IF NOT EXISTS idx_executions_workflow ON executions(workflow_id);
CREATE INDEX IF NOT EXISTS idx_executions_started ON executions(started_at);
CREATE INDEX IF NOT EXISTS idx_execution_steps_exec ON execution_steps(execution_id);
