import { db } from "../../db";
import {
  decisionDrivers,
  items,
  scoringScaleOptions,
  decisionDriverScoringOptions,
  type DecisionDriver,
  type ScoringScaleOption,
} from "../../db/schema";

import { eq, and, asc } from "drizzle-orm";

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

export async function getDriverWithScoringOptions(
  driverId: string
): Promise<{
  driver: DecisionDriver;
  scoringOptions: ScoringScaleOption[];
}> {
  const driver = await db
    .select()
    .from(decisionDrivers)
    .where(eq(decisionDrivers.id, driverId))
    .limit(1)
    .get();

  if (!driver) {
    throw new Error("Driver not found");
  }

  const scoringOptions = await db
    .select({
      id: scoringScaleOptions.id,
      label: scoringScaleOptions.label,
      value: scoringScaleOptions.value,
      sortOrder: scoringScaleOptions.sortOrder,
      createdOn: scoringScaleOptions.createdOn,
      updatedOn: scoringScaleOptions.updatedOn,
    })
    .from(scoringScaleOptions)
    .innerJoin(
      decisionDriverScoringOptions,
      eq(decisionDriverScoringOptions.scoringOptionId, scoringScaleOptions.id)
    )
    .where(eq(decisionDriverScoringOptions.driverId, driverId))
    .orderBy(asc(scoringScaleOptions.sortOrder));

  return { driver, scoringOptions };
}

export async function getDriverWithScoringOptionsAndItems(
  driverId: string
): Promise<{
  driver: DecisionDriver;
  scoringOptions: ScoringScaleOption[];
  existingItems: { id: string; name: string }[];
}> {
  const { driver, scoringOptions } = await getDriverWithScoringOptions(driverId);
  
  const existingItems = await db
    .select({ id: items.id, name: items.name })
    .from(items)
    .where(and(eq(items.projectId, driver.projectId), eq(items.archived, 0)))
    .orderBy(asc(items.name));

  return { driver, scoringOptions, existingItems };
}