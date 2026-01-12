// /electron/db/backup.ts
import { dialog, BrowserWindow, app, BaseWindow } from "electron";
import path from "node:path";
import { getSqlite } from "../index";

function escapeSqliteString(value: string) {
  // SQLite string literal escaping for single quotes
  return value.replace(/'/g, "''");
}

const exportBackup = async (opts?: { window?: BrowserWindow }) => {
  const win = opts?.window;

  const defaultName = `prioritizer-backup-${new Date()
    .toISOString()
    .slice(0, 10)}.db`;

  const { canceled, filePath } = await dialog.showSaveDialog(
    win as BaseWindow,
    {
      title: "Export Backup",
      defaultPath: path.join(app.getPath("documents"), defaultName),
      filters: [{ name: "SQLite Database", extensions: ["db"] }],
    }
  );

  if (canceled || !filePath) {
    return { ok: false as const, reason: "cancelled" as const };
  }

  const sqlite = getSqlite();

  // Make sure WAL is checkpointed so backup includes latest writes
  sqlite.pragma("wal_checkpoint(TRUNCATE)");

  // Create a consistent single-file backup
  const escapedPath = escapeSqliteString(filePath);
  sqlite.exec(`VACUUM INTO '${escapedPath}'`);

  return { ok: true as const, path: filePath };
};

export { exportBackup };
