import { app } from "electron";
import fs from "node:fs";
import path from "node:path";
import { closeDb, getDbFilePath } from "../index";

/**
 * Delete the database file and close the current connection.
 * This will effectively reset the application's database state.
 */
const deleteDatabase = async () => {
  console.log("deleteDatabase: Starting database deletion process");

  // Close any existing database connections
  closeDb();

  // Get the database file path
  const dbPath = getDbFilePath();
  console.log("deleteDatabase: Database path:", dbPath);

  // Remove the database file if it exists
  try {
    if (fs.existsSync(dbPath)) {
      console.log("deleteDatabase: Removing database file");
      fs.rmSync(dbPath);
      console.log("deleteDatabase: Database file removed successfully");
    } else {
      console.log("deleteDatabase: Database file does not exist");
    }

    // Also remove any WAL/SHM files that might exist
    for (const suffix of ["-wal", "-shm"] as const) {
      const walPath = `${dbPath}${suffix}`;
      if (fs.existsSync(walPath)) {
        console.log("deleteDatabase: Removing WAL/SHM file:", walPath);
        fs.rmSync(walPath);
      }
    }

    console.log("deleteDatabase: Database deletion completed successfully");
    return { ok: true as const };
  } catch (error) {
    console.log("deleteDatabase: Failed to delete database:", error);
    return {
      ok: false as const,
      error: error instanceof Error ? error.message : String(error),
    };
  }
};

export { deleteDatabase };
