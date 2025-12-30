import { sqliteTable, text, integer, uniqueIndex } from "drizzle-orm/sqlite-core";
import { InferInsertModel, InferSelectModel } from "drizzle-orm";

export const projects = sqliteTable(
  "projects",
  {
    id: text("id").primaryKey().notNull(),
    name: text("name").notNull(),
    shortId: text("short_id").notNull(),
    description: text("description"),
    createdOn: text("created_on").notNull(),
    updatedOn: text("updated_on").notNull(),
    archived: integer("archived").notNull().default(0), // 0/1
    archivedOn: text("archived_on"),
  },
  (t) => ({
    shortIdUnique: uniqueIndex("projects_short_id_unique").on(t.shortId),
  })
);

export type Project = InferSelectModel<typeof projects>;
export type NewProject = InferInsertModel<typeof projects>;