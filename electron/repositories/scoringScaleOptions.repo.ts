// electron/repositories/scoringScaleOptions.repo.ts
import { db } from "../../electron/db";
import {
  scoringScaleOptions,
  itemDriverScores,
  type NewScoringScaleOption,
  type ScoringScaleOption,
} from "../db/schema/";
import { calculateAllItemScores } from "./items.repo";
import { and, asc, desc, eq, sql } from "drizzle-orm";
import { randomUUID } from "crypto";

export async function listScoringScaleOptions(
  scaleId: string
): Promise<ScoringScaleOption[]> {
  return db
    .select()
    .from(scoringScaleOptions)
    .where(and(eq(scoringScaleOptions.scaleId, scaleId)))
    .orderBy(desc(scoringScaleOptions.value), asc(scoringScaleOptions.label));
}

export async function createScoringScaleOption(
  input: Pick<NewScoringScaleOption, "scaleId" | "label" | "value"> &
    Partial<Pick<NewScoringScaleOption, "sortOrder">> & { projectId: string }
): Promise<ScoringScaleOption> {
  const now = new Date().toISOString();

  const [option] = await db
    .insert(scoringScaleOptions)
    .values({
      id: randomUUID(),
      scaleId: input.scaleId,
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
  input: Partial<ScoringScaleOption> &
    Pick<ScoringScaleOption, "id">
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
    console.log("Detected scoring option value change for: ", input.label)
    await db
      .update(itemDriverScores)
      .set({
        value: input.value,
        updatedOn: new Date().toISOString(),
      })
      .where(eq(itemDriverScores.scoringScaleOptionId, input.id));
    //await calculateAllItemScores(input.projectId);
  }

  return option;
}

export async function deleteScoringScaleOption(input: {
  id: string;
}): Promise<ScoringScaleOption> {
  const [option] = await db
    .delete(scoringScaleOptions)
    .where(eq(scoringScaleOptions.id, input.id))
    .returning();
  return option;
}
