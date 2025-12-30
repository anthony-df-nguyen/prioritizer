"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scoringScaleOptionsRelations = exports.scoringScaleOptions = exports.scoringScalesRelations = exports.scoringScales = void 0;
const sqlite_core_1 = require("drizzle-orm/sqlite-core");
const drizzle_orm_1 = require("drizzle-orm");
const projects_1 = require("./projects");
// Scoring Scales
exports.scoringScales = (0, sqlite_core_1.sqliteTable)("scoring_scales", {
    id: (0, sqlite_core_1.text)("id").primaryKey().notNull(),
    projectId: (0, sqlite_core_1.text)("project_id")
        .notNull()
        .references(() => projects_1.projects.id, { onDelete: "cascade" }),
    name: (0, sqlite_core_1.text)("name").notNull(),
    description: (0, sqlite_core_1.text)("description"),
    // Optional: useful later if you ship multiple defaults
    key: (0, sqlite_core_1.text)("key"), // e.g. "HML_3_2_1"
    sortOrder: (0, sqlite_core_1.integer)("sort_order").notNull().default(0),
    createdOn: (0, sqlite_core_1.text)("created_on").notNull(),
    updatedOn: (0, sqlite_core_1.text)("updated_on").notNull(),
    archived: (0, sqlite_core_1.integer)("archived").notNull().default(0),
    archivedOn: (0, sqlite_core_1.text)("archived_on"),
}, (t) => ({
    projectIdIdx: (0, sqlite_core_1.index)("scoring_scales_project_id_idx").on(t.projectId),
    projectNameUnique: (0, sqlite_core_1.uniqueIndex)("scoring_scales_project_name_unique").on(t.projectId, t.name),
    projectKeyUnique: (0, sqlite_core_1.uniqueIndex)("scoring_scales_project_key_unique").on(t.projectId, t.key),
}));
exports.scoringScalesRelations = (0, drizzle_orm_1.relations)(exports.scoringScales, ({ one, many }) => ({
    project: one(projects_1.projects, {
        fields: [exports.scoringScales.projectId],
        references: [projects_1.projects.id],
    }),
    options: many(exports.scoringScaleOptions),
}));
// Scoring Scale Options
exports.scoringScaleOptions = (0, sqlite_core_1.sqliteTable)("scoring_scale_options", {
    id: (0, sqlite_core_1.text)("id").primaryKey().notNull(),
    scaleId: (0, sqlite_core_1.text)("scale_id")
        .notNull()
        .references(() => exports.scoringScales.id, { onDelete: "cascade" }),
    // "High", "Medium", "Low"
    label: (0, sqlite_core_1.text)("label").notNull(),
    // 3, 2, 1 (or 1..5 etc)
    value: (0, sqlite_core_1.integer)("value").notNull(),
    sortOrder: (0, sqlite_core_1.integer)("sort_order").notNull().default(0),
    createdOn: (0, sqlite_core_1.text)("created_on").notNull(),
    updatedOn: (0, sqlite_core_1.text)("updated_on").notNull()
}, (t) => ({
    scaleIdIdx: (0, sqlite_core_1.index)("scoring_scale_options_scale_id_idx").on(t.scaleId),
    scaleLabelUnique: (0, sqlite_core_1.uniqueIndex)("scoring_scale_options_scale_label_unique").on(t.scaleId, t.label),
}));
exports.scoringScaleOptionsRelations = (0, drizzle_orm_1.relations)(exports.scoringScaleOptions, ({ one }) => ({
    scale: one(exports.scoringScales, {
        fields: [exports.scoringScaleOptions.scaleId],
        references: [exports.scoringScales.id],
    }),
}));
