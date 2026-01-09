import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { InferInsertModel, InferSelectModel,  } from "drizzle-orm";


// ======= Updated scoringScaleOptions table =======
export const scoringScaleOptions = sqliteTable(
  "scoring_scale_options",
  {
    id: text("id").primaryKey().notNull(),
    label: text("label").notNull(),
    value: integer("value").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    createdOn: text("created_on").notNull(),
    updatedOn: text("updated_on").notNull()
  }
);



// ======= Updated exports =======
export type ScoringScaleOption = InferSelectModel<typeof scoringScaleOptions>;
export type NewScoringScaleOption = InferInsertModel<typeof scoringScaleOptions>;

