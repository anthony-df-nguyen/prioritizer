import path from "node:path";
import { app } from "electron";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";

/**
 * Runs database migrations using Drizzle's migration system.
 * 
 * For packaged applications, migrations are loaded from the resources path.
 * For development, migrations are loaded from the app's drizzle folder.
 * 
 * @param db - The database instance to run migrations on
 */
export function runMigrations<TSchema extends Record<string, unknown>>(
  db: BetterSQLite3Database<TSchema>
) {
  const migrationsFolder = app.isPackaged
    ? path.join(process.resourcesPath, "drizzle")
    : path.join(app.getAppPath(), "drizzle");

  migrate(db, { migrationsFolder });
}