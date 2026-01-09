import { and, eq, desc } from "drizzle-orm";

import { db } from "../../db";
import {
  items,
  itemDriverScores,
  type Item,
  type ItemDriverScore,
} from "../../db/schema";

/**
 * List non-archived items for a given project.
 */
export async function listItemsByProject(projectId: string): Promise<Item[]> {
  return db
    .select()
    .from(items)
    .where(and(eq(items.projectId, projectId), eq(items.archived, 0)))
    .orderBy(desc(items.score));
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
