declare module 'sql.js' {
  export interface SqlJsStatic {
    Database: new (data?: BufferSource) => Database;
  }
  export interface Database {
    run(sql: string, params?: unknown[]): void;
    exec(sql: string): QueryExecResult[];
    prepare(sql: string): Statement;
    getRowsModified(): number;
    export(): Uint8Array;
    close(): void;
  }
  export interface Statement {
    bind(params: unknown[]): boolean;
    step(): boolean;
    getAsObject(): Record<string, unknown>;
    free(): boolean;
  }
  export interface QueryExecResult {
    columns: string[];
    values: unknown[][];
  }
  export default function initSqlJs(config?: unknown): Promise<SqlJsStatic>;
}
