import { and, eq, sql } from "drizzle-orm";

import { db } from "../../db";
import {
  items,
  itemDriverScores,
  decisionDrivers,
  type Item,
  type ItemDriverScore,
} from "../../db/schema";

/**
 * Update basic item fields.
 */
export async function updateItem(
  input: Pick<Item, "id"> &
    Partial<Pick<Item, "name" | "description" | "archived" | "archivedOn">>
): Promise<Item> {
  const now = new Date().toISOString();

  const item = await db
    .update(items)
    .set({
      ...input,
      updatedOn: now,
      archivedOn:
        typeof input.archived === "number" && input.archived === 1
          ? input.archivedOn ?? now
          : input.archivedOn ?? null,
    })
    .where(eq(items.id, input.id))
    .returning()
    .get();

  if (!item) throw new Error("Failed to update item");
  return item;
}

/**
 * Calculate and update the score for a single item based on its driver scores.
 */
export async function calculateItemScore(itemId: string): Promise<void> {
  // Get the item to ensure it exists
  const item = await db
    .select({ id: items.id, name: items.name, score: items.score })
    .from(items)
    .where(eq(items.id, itemId))
    .get();

  if (!item) {
    throw new Error(`Item with ID ${itemId} not found`);
  }

  // Calculate the weighted score for this specific item
  const score = await db
    .select({
      total: sql<number>`SUM(${itemDriverScores.value} * ${decisionDrivers.weight})`,
    })
    .from(itemDriverScores)
    .leftJoin(
      decisionDrivers,
      eq(itemDriverScores.driverId, decisionDrivers.id)
    )
    .where(
      and(
        eq(itemDriverScores.itemId, itemId),
        eq(decisionDrivers.archived, 0) // Only include active drivers
      )
    )
    .groupBy(itemDriverScores.itemId);

  const totalScore = score[0]?.total ?? null;
  console.log(`Total Score for ${item.name} was ${item.score} => ${totalScore}`);

  // Update the item's score
  await db.update(items).set({ score: totalScore }).where(eq(items.id, itemId));
}

/**
 * Calculate and update scores for all items in a project.
 * This is needed when scoring scale configurations change.
 */
export async function calculateAllItemScores(projectId: string): Promise<void> {
  // Get all items in the project
  const findItems = await db
    .select({ id: items.id })
    .from(items)
    .where(eq(items.projectId, projectId));

  console.log(
    `Running calculateAllItemScores for project ${projectId}`
  );

  // For each item, calculate the weighted score
  for (const item of findItems) {
    await calculateItemScore(item.id); // Reuse the single-item function
  }
}

export async function setItemDriverScore(input: {
  itemId: string;
  driverId: string;
  scoringScaleOptionId: string | null;
  value: number | null;
}): Promise<ItemDriverScore> {
  const now = new Date().toISOString();

  const row = await db
    .update(itemDriverScores)
    .set({
      scoringScaleOptionId: input.scoringScaleOptionId,
      value: input.value,
      updatedOn: now,
    })
    .where(
      and(
        eq(itemDriverScores.itemId, input.itemId),
        eq(itemDriverScores.driverId, input.driverId)
      )
    )
    .returning()
    .get();

  // Only calculate the score for the specific item that was updated
  await calculateItemScore(input.itemId);

  if (!row) throw new Error("Failed to set item driver score");
  return row;
}
