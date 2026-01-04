import { sqliteTable, text, integer, index, uniqueIndex } from "drizzle-orm/sqlite-core";
import { InferInsertModel, InferSelectModel, relations } from "drizzle-orm";

import { projects } from "./projects";
import { decisionDrivers } from "./drivers";
import { scoringScaleOptions } from "./scoringScales"; // adjust path/name if your file exports differ

export const items = sqliteTable(
  "items",
  {
    id: text("id").primaryKey().notNull(),

    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),

    name: text("name").notNull(),
    description: text("description"),

    createdOn: text("created_on").notNull(),
    updatedOn: text("updated_on").notNull(),

    archived: integer("archived").notNull().default(0), // 0/1
    archivedOn: text("archived_on"),
    score: integer("score"), // nullable until calculated
  },
  (t) => ({
    projectIdIdx: index("items_project_id_idx").on(t.projectId),
    archivedIdx: index("items_archived_idx").on(t.archived),
  })
);

export const itemDriverScores = sqliteTable(
  "item_driver_scores",
  {
    id: text("id").primaryKey().notNull(),

    itemId: text("item_id")
      .notNull()
      .references(() => items.id, { onDelete: "cascade" }),

    driverId: text("driver_id")
      .notNull()
      .references(() => decisionDrivers.id, { onDelete: "cascade" }),

    // The chosen option (ties back to the driver's scoring scale)
    scoringScaleOptionId: text("scoring_scale_option_id").references(
      () => scoringScaleOptions.id,
      { onDelete: "set null" } // keeps the score row if an option is deleted later
    ),

    // Cached integer at time of selection (fast totals + preserves history)
    value: integer("value"), // nullable until user scores it

    createdOn: text("created_on").notNull(),
    updatedOn: text("updated_on").notNull(),
  },
  (t) => ({
    itemIdIdx: index("item_driver_scores_item_id_idx").on(t.itemId),
    driverIdIdx: index("item_driver_scores_driver_id_idx").on(t.driverId),

    // enforce 1 score per driver per item
    itemDriverUnique: uniqueIndex("item_driver_scores_item_driver_unique").on(
      t.itemId,
      t.driverId
    ),
  })
);

// Relations (optional but very useful)
export const itemsRelations = relations(items, ({ one, many }) => ({
  project: one(projects, {
    fields: [items.projectId],
    references: [projects.id],
  }),
  scores: many(itemDriverScores),
}));

export const itemDriverScoresRelations = relations(itemDriverScores, ({ one }) => ({
  item: one(items, {
    fields: [itemDriverScores.itemId],
    references: [items.id],
  }),
  driver: one(decisionDrivers, {
    fields: [itemDriverScores.driverId],
    references: [decisionDrivers.id],
  }),
  option: one(scoringScaleOptions, {
    fields: [itemDriverScores.scoringScaleOptionId],
    references: [scoringScaleOptions.id],
  }),
}));

export type Item = InferSelectModel<typeof items>;
export type NewItem = InferInsertModel<typeof items>;

export type ItemDriverScore = InferSelectModel<typeof itemDriverScores>;
export type NewItemDriverScore = InferInsertModel<typeof itemDriverScores>;