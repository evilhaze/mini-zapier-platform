import initSqlJs from 'sql.js';
import type { Database } from 'sql.js';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const defaultDir = join(__dirname, '../../../data');
const dbPath = process.env.DB_PATH || join(defaultDir, 'workflows.db');

if (!existsSync(defaultDir)) {
  mkdirSync(defaultDir, { recursive: true });
}

let sqlDb: Database | null = null;

function persist() {
  if (sqlDb) {
    const data = sqlDb.export();
    const buffer = Buffer.from(data);
    writeFileSync(dbPath, buffer);
  }
}

function prepare(sql: string) {
  if (!sqlDb) throw new Error('DB not initialized');
  return {
    run(...params: unknown[]) {
      sqlDb!.run(sql, params as number[] | string[]);
      let lastInsertRowid = 0;
      try {
        const r = sqlDb!.exec('SELECT last_insert_rowid() as id');
        if (r[0]?.values[0]) lastInsertRowid = r[0].values[0][0] as number;
      } catch {
        // ignore
      }
      persist();
      return { lastInsertRowid, changes: sqlDb!.getRowsModified() };
    },
    get(...params: unknown[]) {
      const stmt = sqlDb!.prepare(sql);
      stmt.bind(params as number[] | string[]);
      const row = stmt.step() ? (stmt.getAsObject() as Record<string, unknown>) : null;
      stmt.free();
      return row;
    },
    all(...params: unknown[]) {
      const stmt = sqlDb!.prepare(sql);
      stmt.bind(params as number[] | string[]);
      const rows: Record<string, unknown>[] = [];
      while (stmt.step()) rows.push(stmt.getAsObject() as Record<string, unknown>);
      stmt.free();
      return rows;
    },
  };
}

export const db = {
  prepare,
  exec(sql: string) {
    if (sqlDb) sqlDb.run(sql);
    persist();
  },
};

export async function initDb() {
  const SQL = await initSqlJs();
  if (existsSync(dbPath)) {
    const buffer = readFileSync(dbPath);
    sqlDb = new SQL.Database(buffer);
  } else {
    sqlDb = new SQL.Database();
  }
  const schema = readFileSync(join(__dirname, 'schema.sql'), 'utf-8');
  sqlDb.run(schema);
  persist();
}

export type Workflow = {
  id: string;
  name: string;
  description: string | null;
  definition: string;
  enabled: number;
  created_at: string;
  updated_at: string;
};

export type Execution = {
  id: string;
  workflow_id: string;
  trigger_type: string;
  status: string;
  started_at: string;
  finished_at: string | null;
  error_message: string | null;
};

export type ExecutionStep = {
  id: number;
  execution_id: string;
  node_id: string;
  step_index: number;
  status: string;
  input_data: string | null;
  output_data: string | null;
  error_message: string | null;
  started_at: string;
  finished_at: string | null;
  retry_count: number;
};
