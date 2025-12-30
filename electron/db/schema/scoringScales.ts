import { sqliteTable, text, integer, index, uniqueIndex } from "drizzle-orm/sqlite-core";
import { InferInsertModel, InferSelectModel, relations } from "drizzle-orm";
import { OutputOf } from "@/shared/ipc/types";
import { projects } from "./projects";

// Scoring Scales
export const scoringScales = sqliteTable(
  "scoring_scales",
  {
    id: text("id").primaryKey().notNull(),

    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),

    name: text("name").notNull(),
     description: text("description"),
    // Optional: useful later if you ship multiple defaults
    key: text("key"), // e.g. "HML_3_2_1"

    sortOrder: integer("sort_order").notNull().default(0),

    createdOn: text("created_on").notNull(),
    updatedOn: text("updated_on").notNull(),

    archived: integer("archived").notNull().default(0),
    archivedOn: text("archived_on"),
  },
  (t) => ({
    projectIdIdx: index("scoring_scales_project_id_idx").on(t.projectId),
    projectNameUnique: uniqueIndex("scoring_scales_project_name_unique").on(
      t.projectId,
      t.name
    ),
    projectKeyUnique: uniqueIndex("scoring_scales_project_key_unique").on(
      t.projectId,
      t.key
    ),
  })
);

export const scoringScalesRelations = relations(scoringScales, ({ one, many }) => ({
  project: one(projects, {
    fields: [scoringScales.projectId],
    references: [projects.id],
  }),
  options: many(scoringScaleOptions),
}));

export type ScoringScale = InferSelectModel<typeof scoringScales>;
export type NewScoringScale = InferInsertModel<typeof scoringScales>;


// Scoring Scale Options
export const scoringScaleOptions = sqliteTable(
  "scoring_scale_options",
  {
    id: text("id").primaryKey().notNull(),

    scaleId: text("scale_id")
      .notNull()
      .references(() => scoringScales.id, { onDelete: "cascade" }),

    // "High", "Medium", "Low"
    label: text("label").notNull(),

    // 3, 2, 1 (or 1..5 etc)
    value: integer("value").notNull(),

    sortOrder: integer("sort_order").notNull().default(0),

    createdOn: text("created_on").notNull(),
    updatedOn: text("updated_on").notNull()
  },
  (t) => ({
    scaleIdIdx: index("scoring_scale_options_scale_id_idx").on(t.scaleId),
    scaleLabelUnique: uniqueIndex("scoring_scale_options_scale_label_unique").on(
      t.scaleId,
      t.label
    ),
  })
);
export const scoringScaleOptionsRelations = relations(scoringScaleOptions, ({ one }) => ({
  scale: one(scoringScales, {
    fields: [scoringScaleOptions.scaleId],
    references: [scoringScales.id],
  }),
}));

export type ScoringScaleOption = InferSelectModel<typeof scoringScaleOptions>;
export type NewScoringScaleOption = InferInsertModel<typeof scoringScaleOptions>;

// Final


// Add the scoring scale options to the scoring scale type
export type ScoringScaleWithOptions = ScoringScale & {
  options: OutputOf<"scoringScaleOption:listByScale">;
};