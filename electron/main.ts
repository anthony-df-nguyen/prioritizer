// electron/main.ts
import { app, BrowserWindow, ipcMain } from "electron";
import path from "node:path";

import { getDb } from "./db";
import { runMigrations } from "./db/migrate";
import { registerIpcHandlers } from "./ipc";

const isDev = !app.isPackaged;

let mainWindow: BrowserWindow | null = null;

async function createWindow() {
  //console.log("Looking for preload at ", path.join(__dirname, "preload.js"))
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  await mainWindow.loadURL(
    isDev ? "http://localhost:3000" : "http://localhost:3000"
  );

  if (isDev) {
    mainWindow.webContents.openDevTools({ mode: "right" });
  }
}

function registerCoreIpc() {
  // Keep truly global/system handlers here
  ipcMain.handle("app:ping", async () => "pong");
}

app.whenReady().then(async () => {
  const db = getDb();
  //console.log("db: ", db);
  runMigrations(db);

  registerCoreIpc();
  registerIpcHandlers();

  await createWindow();

  app.on("activate", async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      await createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
