import { randomUUID } from "crypto";
import { and, eq, sql } from "drizzle-orm";

import { db } from "../../electron/db";
import {
  items,
  itemDriverScores,
  type Item,
  type NewItem,
  type ItemDriverScore,
} from "../db/schema/items";
import { decisionDrivers } from "../db/schema/drivers";

/**
 * List non-archived items for a given project.
 */
export async function listItemsByProject(projectId: string): Promise<Item[]> {
  return db
    .select()
    .from(items)
    .where(and(eq(items.projectId, projectId), eq(items.archived, 0)))
    .orderBy(items.name);
}

export type CreateItemInput = Pick<
  NewItem,
  "projectId" | "name" | "description"
> &
  Partial<Pick<NewItem, "id">>;

/**
 * Create an item and initialize score rows for every non-archived driver in the project.
 */
export const createItem = async (itemData: CreateItemInput): Promise<Item> => {
  const now = new Date().toISOString();
  const itemId = itemData.id ?? randomUUID();

  let createdItem: Item | undefined;

  await db.transaction((tx) => {
    // 1) Create the item
    const item = tx
      .insert(items)
      .values({
        ...itemData,
        id: itemId,
        createdOn: now,
        updatedOn: now,
        archived: 0,
        archivedOn: null,
      })
      .returning()
      .get();

    if (!item) {
      throw new Error("Failed to insert item");
    }

    createdItem = item;

    // 2) Fetch all non-archived drivers for this project
    const drivers = tx
      .select({ id: decisionDrivers.id })
      .from(decisionDrivers)
      .where(
        and(
          eq(decisionDrivers.projectId, item.projectId),
          eq(decisionDrivers.archived, 0)
        )
      )
      .all();

    // 3) Create one score row per driver for this item
    if (drivers.length > 0) {
      tx.insert(itemDriverScores)
        .values(
          drivers.map((driver) => ({
            id: randomUUID(),
            itemId: item.id,
            driverId: driver.id,
            scoringScaleOptionId: null,
            value: null,
            createdOn: now,
            updatedOn: now,
          }))
        )
        .run();
    }
  });

  if (!createdItem) {
    throw new Error("Failed to create item");
  }

  return createdItem;
};

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
 * List score rows for an item.
 */
export async function listItemDriverScores(
  itemId: string
): Promise<ItemDriverScore[]> {
  return db
    .select()
    .from(itemDriverScores)
    .where(eq(itemDriverScores.itemId, itemId));
}

/**
 * Calculate and update the score for a single item based on its driver scores.
 */
export async function calculateItemScore(itemId: string): Promise<void> {
  // Get the item to ensure it exists
  const item = await db
    .select({ id: items.id })
    .from(items)
    .where(eq(items.id, itemId))
    .get();

  if (!item) {
    throw new Error(`Item with ID ${itemId} not found`);
  }

  // Calculate the weighted score for this specific item
  const score = await db
    .select({
      total: sql<number>`SUM(${itemDriverScores.value} * ${decisionDrivers.weight})`
    })
    .from(itemDriverScores)
    .leftJoin(decisionDrivers, eq(itemDriverScores.driverId, decisionDrivers.id))
    .where(and(
      eq(itemDriverScores.itemId, itemId),
      eq(decisionDrivers.archived, 0) // Only include active drivers
    ))
    .groupBy(itemDriverScores.itemId);

  const totalScore = score[0]?.total ?? null;

  // Update the item's score
  await db
    .update(items)
    .set({ score: totalScore })
    .where(eq(items.id, itemId));
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

    console.log(`Running calculateAllItemScores for project ${projectId}. Found: ${findItems}`)

  // For each item, calculate the weighted score
  for (const item of findItems) {
    await calculateItemScore(item.id); // Reuse the single-item function
  }
}

/**
 * Set an item's score for a given driver by selecting a scoringScaleOption.
 * (Also stores the option's integer value in `value`.)
 */
/**
 * Set an item's score for a given driver by selecting a scoringScaleOption.
 * (Also stores the option's integer value in `value`.)
 * This function recalculates only the specific item's score.
 */
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
