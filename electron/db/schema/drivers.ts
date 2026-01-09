import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
import { InferInsertModel, InferSelectModel, relations } from "drizzle-orm";
import { projects } from "./projects";
import { scoringScaleOptions } from "./scoringScales";

// Junction table for many-to-many relationship between drivers and scoring options
export const decisionDriverScoringOptions = sqliteTable(
  "decision_driver_scoring_options",
  {
    driverId: text("driver_id")
      .notNull()
      .references(() => decisionDrivers.id, { onDelete: "cascade" }),
    scoringOptionId: text("scoring_option_id")
      .notNull()
      .references(() => scoringScaleOptions.id, { onDelete: "cascade" }),
  },
  (t) => ({
    driverIdIdx: index("decision_driver_scoring_options_driver_id_idx").on(t.driverId),
    scoringOptionIdIdx: index("decision_driver_scoring_options_scoring_option_id_idx").on(t.scoringOptionId),
  })
);

export const decisionDriverScoringOptionsRelations = relations(decisionDriverScoringOptions, ({ one }) => ({
  driver: one(decisionDrivers, {
    fields: [decisionDriverScoringOptions.driverId],
    references: [decisionDrivers.id],
  }),
  scoringOption: one(scoringScaleOptions, {
    fields: [decisionDriverScoringOptions.scoringOptionId],
    references: [scoringScaleOptions.id],
  }),
}));

export const decisionDrivers = sqliteTable(
  "decision_drivers",
  {
    id: text("id").primaryKey().notNull(),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),

    name: text("name").notNull(),
    description: text("description"),
    weight: integer("weight").notNull(),

    createdOn: text("created_on").notNull(),
    updatedOn: text("updated_on").notNull(),

    archived: integer("archived").notNull().default(0), // 0/1
    archivedOn: text("archived_on"),
  },
  (t) => ({
    projectIdIdx: index("decision_drivers_project_id_idx").on(t.projectId),
  })
);

// Updated relations to include the many-to-many relationship
export const decisionDriversRelations = relations(decisionDrivers, ({ one, many }) => ({
  project: one(projects, {
    fields: [decisionDrivers.projectId],
    references: [projects.id],
  }),
  scoringOptions: many(decisionDriverScoringOptions),
}));

export type DecisionDriver = InferSelectModel<typeof decisionDrivers>;
export type NewDecisionDriver = InferInsertModel<typeof decisionDrivers>;
export type DecisionDriverScoringOption = InferInsertModel<typeof decisionDriverScoringOptions>;