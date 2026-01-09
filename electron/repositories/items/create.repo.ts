import { randomUUID } from "crypto";
import { and, eq } from "drizzle-orm";

import { db } from "../../db";
import {
  items,
  itemDriverScores,
  decisionDrivers,
  type Item, type NewItem
} from "../../db/schema";

/**
 * Create an item and initialize score rows for every non-archived driver in the project.
 */

export type CreateItemInput = Pick<
  NewItem,
  "projectId" | "name" | "description"
> &
  Partial<Pick<NewItem, "id">>;

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
