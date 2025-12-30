"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decisionDriversRelations = exports.decisionDrivers = void 0;
const sqlite_core_1 = require("drizzle-orm/sqlite-core");
const drizzle_orm_1 = require("drizzle-orm");
const projects_1 = require("./projects");
const scoringScales_1 = require("./scoringScales");
exports.decisionDrivers = (0, sqlite_core_1.sqliteTable)("decision_drivers", {
    id: (0, sqlite_core_1.text)("id").primaryKey().notNull(),
    projectId: (0, sqlite_core_1.text)("project_id")
        .notNull()
        .references(() => projects_1.projects.id, { onDelete: "cascade" }),
    scaleId: (0, sqlite_core_1.text)("scale_id")
        .notNull()
        .references(() => scoringScales_1.scoringScales.id, { onDelete: "restrict" }),
    name: (0, sqlite_core_1.text)("name").notNull(),
    description: (0, sqlite_core_1.text)("description"),
    weight: (0, sqlite_core_1.integer)("weight").notNull(),
    createdOn: (0, sqlite_core_1.text)("created_on").notNull(),
    updatedOn: (0, sqlite_core_1.text)("updated_on").notNull(),
    archived: (0, sqlite_core_1.integer)("archived").notNull().default(0), // 0/1
    archivedOn: (0, sqlite_core_1.text)("archived_on"),
}, (t) => ({
    projectIdIdx: (0, sqlite_core_1.index)("decision_drivers_project_id_idx").on(t.projectId),
    scaleIdIdx: (0, sqlite_core_1.index)("decision_drivers_scale_id_idx").on(t.scaleId),
}));
// Optional but nice: gives you typed relation helpers later
exports.decisionDriversRelations = (0, drizzle_orm_1.relations)(exports.decisionDrivers, ({ one }) => ({
    project: one(projects_1.projects, {
        fields: [exports.decisionDrivers.projectId],
        references: [projects_1.projects.id],
    }),
    scale: one(scoringScales_1.scoringScales, {
        fields: [exports.decisionDrivers.scaleId],
        references: [scoringScales_1.scoringScales.id],
    }),
}));
