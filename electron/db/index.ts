import path from "node:path";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { app } from "electron";
import * as schema from "./schema";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";

export function getDbFilePath() {
  console.log("getDbFilePath: Getting database file path");
  return path.join(app.getPath("userData"), "prioritizer.db");
}

let _sqlite: Database.Database | null = null;
let _db: BetterSQLite3Database<typeof schema> | null = null;

function createDbInternal() {
  console.log("createDbInternal: Starting database creation");
  const sqlite = new Database(getDbFilePath());
  console.log("createDbInternal: Database instance created");

  // ✅ REQUIRED: enable FK enforcement
  sqlite.pragma("foreign_keys = ON");
  console.log("createDbInternal: Foreign keys enabled");

  // Recommended for Electron apps
  sqlite.pragma("journal_mode = WAL");
  console.log("createDbInternal: WAL journal mode set");

  _sqlite = sqlite;
  _db = drizzle(sqlite, { schema });
  console.log("createDbInternal: Drizzle database created");

  return _db;
}

export function getDb(): BetterSQLite3Database<typeof schema> {
  //console.log("getDb: Checking if DB already exists");
  if (_db) {
    //console.log("getDb: Returning existing DB instance");
    return _db;
  }
  //console.log("getDb: Creating new DB instance");
  return createDbInternal();
}

/**
 * Access the underlying better-sqlite3 client for low-level operations
 * like VACUUM INTO, wal_checkpoint, etc.
 */
export function getSqlite(): Database.Database {
  //console.log("getSqlite: Checking if SQLite client exists");
  if (_sqlite) {
    //console.log("getSqlite: Returning existing SQLite client");
    return _sqlite;
  }
  //console.log("getSqlite: Initializing DB to set up SQLite client");
  // Ensure DB is initialized (sets _sqlite)
  getDb();
  if (!_sqlite) throw new Error("SQLite client was not initialized");
  console.log("getSqlite: SQLite client initialized and returned");
  return _sqlite;
}

/**
 * Close the DB (useful before imports, app shutdown, etc.)
 */
export function closeDb() {
  console.log("closeDb: Starting database close operation");
  if (_sqlite) {
    console.log("closeDb: Closing SQLite connection");
    _sqlite.close();
    _sqlite = null;
  }
  console.log("closeDb: Setting DB reference to null");
  _db = null;
  console.log("closeDb: Database close operation completed");
}

export const db = new Proxy({} as BetterSQLite3Database<typeof schema>, {
  get(_target, prop) {
    //console.log("db proxy get: Accessing property", prop.toString());
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (getDb() as any)[prop as any];
  },
});