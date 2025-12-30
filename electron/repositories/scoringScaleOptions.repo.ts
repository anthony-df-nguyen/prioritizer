// electron/repositories/scoringScaleOptions.repo.ts
import { db } from "../../electron/db";
import {
  scoringScaleOptions,
  type NewScoringScaleOption,
  type ScoringScaleOption,
} from "../db/schema/";
import { and, asc,desc, eq } from "drizzle-orm";
import { randomUUID } from "crypto";

export async function listScoringScaleOptions(scaleId: string): Promise<ScoringScaleOption[]> {
  return db
    .select()
    .from(scoringScaleOptions)
    .where(and(eq(scoringScaleOptions.scaleId, scaleId)))
    .orderBy(desc(scoringScaleOptions.value), asc(scoringScaleOptions.label));
}

export async function createScoringScaleOption(
  input: Pick<NewScoringScaleOption, "scaleId" | "label" | "value"> &
    Partial<Pick<NewScoringScaleOption, "sortOrder">>
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
  input: Partial<ScoringScaleOption> & Pick<ScoringScaleOption, "id">
): Promise<ScoringScaleOption> {
  const [option] = await db
    .update(scoringScaleOptions)
    .set({
      ...input,
      updatedOn: new Date().toISOString(),
    })
    .where(eq(scoringScaleOptions.id, input.id))
    .returning();

  return option;
}

export async function deleteScoringScaleOption(
  id: string
): Promise<ScoringScaleOption> {
  const [option] = await db
    .delete(scoringScaleOptions)
    .where(eq(scoringScaleOptions.id, id))
    .returning();

  return option;
}