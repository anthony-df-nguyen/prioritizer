"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// electron/main.ts
const electron_1 = require("electron");
const node_path_1 = __importDefault(require("node:path"));
const db_1 = require("./db");
const migrate_1 = require("./db/migrate");
const ipc_1 = require("./ipc");
const isDev = !electron_1.app.isPackaged;
let mainWindow = null;
async function createWindow() {
    //console.log("Looking for preload at ", path.join(__dirname, "preload.js"))
    mainWindow = new electron_1.BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: node_path_1.default.join(__dirname, "preload.js"),
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: false,
        },
    });
    await mainWindow.loadURL(isDev ? "http://localhost:3000" : "http://localhost:3000");
    if (isDev) {
        mainWindow.webContents.openDevTools({ mode: "right" });
    }
}
function registerCoreIpc() {
    // Keep truly global/system handlers here
    electron_1.ipcMain.handle("app:ping", async () => "pong");
}
electron_1.app.whenReady().then(async () => {
    const db = (0, db_1.createDb)();
    //console.log("db: ", db);
    (0, migrate_1.runMigrations)(db);
    registerCoreIpc();
    (0, ipc_1.registerIpcHandlers)();
    await createWindow();
    electron_1.app.on("activate", async () => {
        if (electron_1.BrowserWindow.getAllWindows().length === 0) {
            await createWindow();
        }
    });
});
electron_1.app.on("window-all-closed", () => {
    if (process.platform !== "darwin")
        electron_1.app.quit();
});
