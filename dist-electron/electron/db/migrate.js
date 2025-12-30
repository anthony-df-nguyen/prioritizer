"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runMigrations = runMigrations;
const node_path_1 = __importDefault(require("node:path"));
const electron_1 = require("electron");
const migrator_1 = require("drizzle-orm/better-sqlite3/migrator");
/**
 * Runs database migrations using Drizzle's migration system.
 *
 * For packaged applications, migrations are loaded from the resources path.
 * For development, migrations are loaded from the app's drizzle folder.
 *
 * @param db - The database instance to run migrations on
 */
function runMigrations(db) {
    const migrationsFolder = electron_1.app.isPackaged
        ? node_path_1.default.join(process.resourcesPath, "drizzle")
        : node_path_1.default.join(electron_1.app.getAppPath(), "drizzle");
    (0, migrator_1.migrate)(db, { migrationsFolder });
}
