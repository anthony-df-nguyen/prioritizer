import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
import { InferInsertModel, InferSelectModel, relations } from "drizzle-orm";
import { projects } from "./projects";
import { scoringScales } from "./scoringScales";

export const decisionDrivers = sqliteTable(
  "decision_drivers",
  {
    id: text("id").primaryKey().notNull(),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),

    scaleId: text("scale_id")
      .notNull()
      .references(() => scoringScales.id, { onDelete: "restrict" }),

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
    scaleIdIdx: index("decision_drivers_scale_id_idx").on(t.scaleId),
  })
);

// Optional but nice: gives you typed relation helpers later
export const decisionDriversRelations = relations(decisionDrivers, ({ one }) => ({
  project: one(projects, {
    fields: [decisionDrivers.projectId],
    references: [projects.id],
  }),
  scale: one(scoringScales, {
    fields: [decisionDrivers.scaleId],
    references: [scoringScales.id],
  }),
}));

export type DecisionDriver = InferSelectModel<typeof decisionDrivers>;
export type NewDecisionDriver = InferInsertModel<typeof decisionDrivers>;