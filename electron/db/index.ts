import path from "node:path";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { app } from "electron";
import * as schema from "./schema";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";

export function getDbFilePath() {
  return path.join(app.getPath("userData"), "prioritizer.db");
}

export function createDb(): BetterSQLite3Database<typeof schema> {
  const sqlite = new Database(getDbFilePath());
  // console.log("sqlite:", sqlite);

  // ✅ REQUIRED: enable FK enforcement
  sqlite.pragma("foreign_keys = ON");

  // Recommended for Electron apps
  sqlite.pragma("journal_mode = WAL");

  return drizzle(sqlite, { schema });
}

let _db: BetterSQLite3Database<typeof schema> | null = null;

export function getDb(): BetterSQLite3Database<typeof schema> {
  if (_db) return _db;
  _db = createDb();
  return _db;
}

export const db = new Proxy({} as BetterSQLite3Database<typeof schema>, {
  get(_target, prop) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (getDb() as any)[prop as any];
  },
});