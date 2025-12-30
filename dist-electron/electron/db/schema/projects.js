"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.projects = void 0;
const sqlite_core_1 = require("drizzle-orm/sqlite-core");
exports.projects = (0, sqlite_core_1.sqliteTable)("projects", {
    id: (0, sqlite_core_1.text)("id").primaryKey().notNull(),
    name: (0, sqlite_core_1.text)("name").notNull(),
    shortId: (0, sqlite_core_1.text)("short_id").notNull(),
    description: (0, sqlite_core_1.text)("description"),
    createdOn: (0, sqlite_core_1.text)("created_on").notNull(),
    updatedOn: (0, sqlite_core_1.text)("updated_on").notNull(),
    archived: (0, sqlite_core_1.integer)("archived").notNull().default(0), // 0/1
    archivedOn: (0, sqlite_core_1.text)("archived_on"),
}, (t) => ({
    shortIdUnique: (0, sqlite_core_1.uniqueIndex)("projects_short_id_unique").on(t.shortId),
}));
