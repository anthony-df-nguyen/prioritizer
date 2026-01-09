import { db } from "../../db";
import {
  decisionDrivers,
  items,
  itemDriverScores,
  scoringScaleOptions,
  decisionDriverScoringOptions,
  type NewDecisionDriver,
  type DecisionDriver,
  type NewItemDriverScore,
  type ScoringScaleOption,
} from "../../db/schema";

import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

export async function createDriver(
  input: Pick<
    NewDecisionDriver,
    "projectId" | "name" | "weight" | "description" | "id"
  > & {
    scoringOptions?: Pick<
      ScoringScaleOption,
      "label" | "value" | "sortOrder"
    >[];
  }
): Promise<DecisionDriver> {
  const now = new Date().toISOString();

  console.log("Adding driver: ", input.name);
  console.log("Options Passed: ", input.scoringOptions);
  // 1️⃣ Insert the driver first
  const [driver] = await db
    .insert(decisionDrivers)
    .values({
      id: input.id,
      projectId: input.projectId,
      name: input.name,
      description: input.description,
      weight: input.weight,
      createdOn: now,
      updatedOn: now,
      archived: 0,
    })
    .returning();

  // 2️⃣ Create scoring options if provided
  if (input.scoringOptions && input.scoringOptions.length > 0) {
    // Create all scoring options first
    const createdOptions = [];
    for (const option of input.scoringOptions) {
      const [created] = await db
        .insert(scoringScaleOptions)
        .values({
          id: randomUUID(),
          label: option.label,
          value: option.value,
          sortOrder: option.sortOrder ?? 0,
          createdOn: now,
          updatedOn: now,
        })
        .returning();
      createdOptions.push(created);
    }

    // Get the IDs of created options
    const scoringOptionIds = createdOptions.map((opt) => opt.id);

    // 3️⃣ Link scoring options to the driver
    const linkRows = scoringOptionIds.map((optionId) => ({
      driverId: driver.id,
      scoringOptionId: optionId,
    }));

    await db.insert(decisionDriverScoringOptions).values(linkRows);
  }

  // 4️⃣ Create empty score rows for all existing items in this project
  const existingItems = db
    .select({ id: items.id })
    .from(items)
    .where(eq(items.projectId, input.projectId))
    .all();

  console.log("existingItems: ", existingItems);

  // Build an array of `itemDriverScores` rows
  const scoreRows: NewItemDriverScore[] = existingItems.map((itm) => ({
    id: randomUUID(),
    itemId: itm.id,
    driverId: driver.id,
    value: null,
    createdOn: now,
    updatedOn: now,
  }));
  console.log(
    "Building score rows for newly created driver for existing options",
    scoreRows
  );

  // Bulk-insert them (will hit the uniqueIndex constraint if any conflict)
  if (scoreRows.length) {
    await db.insert(itemDriverScores).values(scoreRows).onConflictDoNothing(); // safety-net – should never happen
  }

  return driver;
}
