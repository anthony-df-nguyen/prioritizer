// /electron/ipc/handlers.ts
import { ipcMain, BrowserWindow } from "electron";
import { exportBackup } from "../db/backup";
import { importBackup } from "../db/import";

export function registerDBIPCHandlers() {
  ipcMain.handle("db:exportBackup", async (event) => {
    try {
      const win = BrowserWindow.fromWebContents(event.sender) ?? undefined;
      return await exportBackup({ window: win });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return { ok: false as const, reason: "error" as const, message };
    }
  });
  ipcMain.handle("db:importBackup", async (event) => {
    const win = BrowserWindow.fromWebContents(event.sender) ?? undefined;

    // importBackup will relaunch+exit by default (per the function we wrote)
    // so you may not see the response on the renderer side—this is expected.
    return importBackup({ window: win, relaunch: true });
  });
}
