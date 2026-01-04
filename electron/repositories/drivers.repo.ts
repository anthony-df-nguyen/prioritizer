// electron/repositories/drivers.repo.ts
import { db } from "../db/";
import {
  decisionDrivers,
  items,
  itemDriverScores,
  type NewDecisionDriver,
  type DecisionDriver,
  type NewItemDriverScore,
} from "../db/schema/";

import { eq, and, asc } from "drizzle-orm";
import { randomUUID } from "crypto";

export async function listActiveDriversByProject(
  projectId: string
): Promise<DecisionDriver[]> {
  return db
    .select()
    .from(decisionDrivers)
    .where(
      and(
        eq(decisionDrivers.projectId, projectId),
        eq(decisionDrivers.archived, 0)
      )
    )
    .orderBy(asc(decisionDrivers.name));
}

export async function listAllDriversByProject(
  projectId: string
): Promise<DecisionDriver[]> {
  return db
    .select()
    .from(decisionDrivers)
    .where(eq(decisionDrivers.projectId, projectId))
    .orderBy(asc(decisionDrivers.name));
}

export async function createDriver(
  input: Pick<
    NewDecisionDriver,
    "projectId" | "name" | "weight" | "scaleId" | "description"
  >
): Promise<DecisionDriver> {
  const now = new Date().toISOString();

  // 1️⃣ Insert the driver first
  const [driver] = await db
    .insert(decisionDrivers)
    .values({
      id: randomUUID(),
      projectId: input.projectId,
      scaleId: input.scaleId,
      name: input.name,
      description: input.description,
      weight: input.weight,
      createdOn: now,
      updatedOn: now,
      archived: 0,
    })
    .returning();

  // 2️⃣ Create empty score rows for all existing items in this project
  await db.transaction(async (trx) => {
    // Grab all items that belong to the same project
    const existingItems = await trx
      .select({ id: items.id })
      .from(items)
      .where(eq(items.projectId, input.projectId));

    // Build an array of `itemDriverScores` rows
    const scoreRows: NewItemDriverScore[] = existingItems.map((itm) => ({
      id: randomUUID(),
      itemId: itm.id,
      driverId: driver.id,
      // `scoringScaleOptionId` stays null until the user actually scores
      value: null,
      createdOn: now,
      updatedOn: now,
    }));

    // Bulk‑insert them (will hit the uniqueIndex constraint if any conflict)
    if (scoreRows.length) {
      await trx
        .insert(itemDriverScores)
        .values(scoreRows)
        .onConflictDoNothing(); // safety‑net – should never happen
    }
  });

  return driver;
}

export async function updateDriver(
  input: Partial<DecisionDriver> & Pick<DecisionDriver, "id">
): Promise<DecisionDriver> {
  const now = new Date().toISOString();

  // Handle archived state: set archivedOn accordingly
  let archivedOnValue: string | null = null;
  if (typeof input.archived !== "undefined") {
    archivedOnValue = input.archived === 1 ? now : null;
  }

  const [driver] = await db
    .update(decisionDrivers)
    .set({
      ...input,
      archivedOn: archivedOnValue,
      updatedOn: now,
    })
    .where(eq(decisionDrivers.id, input.id))
    .returning();

  return driver;
}
