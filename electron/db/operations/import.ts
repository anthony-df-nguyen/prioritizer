import { dialog, BrowserWindow, BaseWindow, app } from "electron";
import fs from "node:fs";
import path from "node:path";
import { getSqlite } from "../index";

/**
 * Import a SQLite database file and overwrite the current DB file on disk.
 * By default, relaunches the app so all DB handles reinitialize cleanly.
 */
const importBackup = async (opts?: {
  window?: BrowserWindow;
  relaunch?: boolean; // default: true
}) => {
  console.log("Starting importBackup function");
  const win = opts?.window;
  const relaunch = opts?.relaunch ?? true;

  console.log("Showing open dialog for file selection");
  const { canceled, filePaths } = await dialog.showOpenDialog(
    win as BaseWindow,
    {
      title: "Import Backup (Overwrite Current Database)",
      properties: ["openFile"],
      filters: [{ name: "SQLite Database", extensions: ["db"] }],
    }
  );

  console.log("Dialog result - canceled:", canceled, "filePaths:", filePaths);
  if (canceled || !filePaths?.[0]) {
    console.log("Import cancelled or no file selected");
    return { ok: false as const, reason: "cancelled" as const };
  }

  const sourcePath = filePaths[0];
  console.log("Source path selected:", sourcePath);

  // Grab the current DB path from the active sqlite connection
  console.log("Getting SQLite connection");
  const sqlite = getSqlite();
  const targetPath = sqlite.name; // better-sqlite3 exposes the filename here
  console.log("Target path from sqlite:", targetPath);

  if (!targetPath || targetPath === ":memory:") {
    console.log("Invalid target path - not a file-backed database");
    return {
      ok: false as const,
      reason: "invalid_target" as const,
      message: "Current database is not a file-backed SQLite database.",
    };
  }

  // 1) Make sure WAL is flushed into the main DB file, then close the handle
  console.log("Flushing WAL checkpoint");
  try {
    sqlite.pragma("wal_checkpoint(TRUNCATE)");
    console.log("WAL checkpoint completed successfully");
  } catch (e) {
    console.log("WAL checkpoint failed (expected if not in WAL mode):", e);
    // ignore (db might not be in WAL mode)
  }

  console.log("Closing SQLite connection");
  try {
    sqlite.close();
    console.log("SQLite connection closed successfully");
  } catch (e) {
    console.log("Failed to close SQLite connection:", e);
    return {
      ok: false as const,
      reason: "close_failed" as const,
      message: e instanceof Error ? e.message : String(e),
    };
  }

  // 2) Remove lingering WAL/SHM files so we don't end up with mismatched state
  console.log("Removing lingering WAL/SHM files");
  for (const suffix of ["-wal", "-shm"] as const) {
    const p = `${targetPath}${suffix}`;
    console.log("Checking for file:", p);
    try {
      if (fs.existsSync(p)) {
        console.log("Removing file:", p);
        fs.rmSync(p, { force: true });
        console.log("File removed successfully:", p);
      } else {
        console.log("File does not exist, skipping:", p);
      }
    } catch (e) {
      console.log("Error removing file", p, ":", e);
      // ignore
    }
  }

  // 3) Overwrite the DB file
  console.log("Overwriting DB file");
  try {
    console.log("Creating directory if needed:", path.dirname(targetPath));
    fs.mkdirSync(path.dirname(targetPath), { recursive: true });
    console.log("Copying file from", sourcePath, "to", targetPath);
    fs.copyFileSync(sourcePath, targetPath);
    console.log("File copy completed successfully");
  } catch (e) {
    console.log("Failed to copy database file:", e);
    return {
      ok: false as const,
      reason: "copy_failed" as const,
      message: e instanceof Error ? e.message : String(e),
    };
  }

  // 4) Relaunch to ensure all cached db/drizzle singletons are recreated cleanly
  console.log("Relaunching app:", relaunch);
  if (relaunch) {
    app.relaunch();

    // Let the IPC return and logs flush, then quit cleanly
    setTimeout(() => {
      app.quit();
    }, 150);

    return { ok: true as const, path: sourcePath, relaunched: true as const };
  }

  console.log("Import completed without relaunch");
  return { ok: true as const, path: sourcePath, relaunched: false as const };
};

export { importBackup };
