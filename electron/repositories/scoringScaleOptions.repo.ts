// electron/repositories/scoringScaleOptions.repo.ts
import { db } from "../../electron/db";
import {
  scoringScaleOptions,
  itemDriverScores,
  DecisionDriver,
  decisionDrivers,
  decisionDriverScoringOptions,
  type NewScoringScaleOption,
  type ScoringScaleOption,
} from "../db/schema/";
import { calculateAllItemScores } from "./items";
import { and, asc, desc, eq, sql } from "drizzle-orm";
import { randomUUID } from "crypto";

export async function listScoringScaleOptions(
  projectId: string
): Promise<ScoringScaleOption[]> {
  // This should list ALL scoring scale options, not just for a specific driver
  return db
    .select()
    .from(scoringScaleOptions)
    .orderBy(desc(scoringScaleOptions.value), asc(scoringScaleOptions.label));
}

export async function listScoringScaleOptionsByDriver(
  driverId: string
): Promise<ScoringScaleOption[]> {
  console.log(`Looking up scale options for driver ${driverId}`)
  return db
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
    .orderBy(desc(scoringScaleOptions.value), asc(scoringScaleOptions.label));
}

export async function createScoringScaleOption(
  input: Pick<NewScoringScaleOption, "label" | "value" | "sortOrder">
): Promise<ScoringScaleOption> {
  const now = new Date().toISOString();
  console.log("Running CreateScoringScaleOption for: ", input.label);

  const [option] = await db
    .insert(scoringScaleOptions)
    .values({
      id: randomUUID(),
      label: input.label,
      value: input.value,
      sortOrder: input.sortOrder ?? 0,
      createdOn: now,
      updatedOn: now,
    })
    .returning();
  return option;
}

export async function updateScoringScaleOption(
  input: Partial<ScoringScaleOption> & Pick<ScoringScaleOption, "id">,
  projectId?: string
): Promise<ScoringScaleOption> {
  // First, get the current option to compare values
  const currentOption = await db
    .select()
    .from(scoringScaleOptions)
    .where(eq(scoringScaleOptions.id, input.id))
    .limit(1);

  if (currentOption.length === 0) {
    throw new Error("Option not found");
  }

  const [option] = await db
    .update(scoringScaleOptions)
    .set({
      ...input,
      updatedOn: new Date().toISOString(),
    })
    .where(eq(scoringScaleOptions.id, input.id))
    .returning();

  // If the value was changed, update related item_driver_scores
  if (input.value !== undefined && input.value !== currentOption[0].value) {
    console.log("Detected scoring option value change for: ", input.label);

    await db
      .update(itemDriverScores)
      .set({
        value: input.value,
        updatedOn: new Date().toISOString(),
      })
      .where(eq(itemDriverScores.scoringScaleOptionId, input.id));
    if (projectId) {
      await calculateAllItemScores(projectId);
    }
  }

  return option;
}
export async function deleteScoringScaleOption(
  input: { id: string },
  projectId?: string
): Promise<ScoringScaleOption> {
  // 1️⃣ Mark dependent scores as orphaned (value & optionId → null)
  await db
    .update(itemDriverScores)
    .set({ scoringScaleOptionId: null, value: null })
    .where(eq(itemDriverScores.scoringScaleOptionId, input.id));

  // 2️⃣ Delete the option itself
  const [option] = await db
    .delete(scoringScaleOptions)
    .where(eq(scoringScaleOptions.id, input.id))
    .returning();

  if (projectId) {
    await calculateAllItemScores(projectId);
  }

  return option;
}
