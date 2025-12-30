// electron/repositories/scoringScales.repo.ts
import { db } from "../../electron/db";
import {
  scoringScales,
  scoringScaleOptions,
  type NewScoringScale,
  type ScoringScale,
  type NewScoringScaleOption,
} from "../db/schema/";
import { and, asc, eq } from "drizzle-orm";
import { randomUUID } from "crypto";

export async function listScoringScales(projectId: string): Promise<ScoringScale[]> {
  return db
    .select()
    .from(scoringScales)
    .where(and(eq(scoringScales.projectId, projectId), eq(scoringScales.archived, 0)))
    .orderBy(asc(scoringScales.sortOrder), asc(scoringScales.name));
}

export async function createScoringScale(
  input: Pick<NewScoringScale, "projectId" | "name"> &
    Partial<Pick<NewScoringScale, "key" | "sortOrder" | "description">>
): Promise<ScoringScale> {
  const now = new Date().toISOString();

  const [scale] = await db
    .insert(scoringScales)
    .values({
      id: randomUUID(),
      projectId: input.projectId,
      name: input.name,
      description: input.description,
      key: input.key ?? null,
      sortOrder: input.sortOrder ?? 0,
      createdOn: now,
      updatedOn: now,
      archived: 0,
      archivedOn: null,
    })
    .returning();

  return scale;
}

export async function updateScoringScale(
  input: Partial<ScoringScale> & Pick<ScoringScale, "id">
): Promise<ScoringScale> {
  const [scale] = await db
    .update(scoringScales)
    .set({
      ...input,
      updatedOn: new Date().toISOString(),
    })
    .where(eq(scoringScales.id, input.id))
    .returning();

  return scale;
}

export async function archiveScoringScale(id: string): Promise<ScoringScale> {
  const now = new Date().toISOString();

  const [scale] = await db
    .update(scoringScales)
    .set({
      archived: 1,
      archivedOn: now,
      updatedOn: now,
    })
    .where(eq(scoringScales.id, id))
    .returning();

  return scale;
}

/**
 * Ensures the default "High / Medium / Low" scale exists for a project, with options.
 * Safe to call repeatedly (idempotent).
 */
export async function ensureDefaultHmlScale(projectId: string): Promise<ScoringScale> {
  const DEFAULT_KEY = "HML_3_2_1";
  const DEFAULT_NAME = "High / Medium / Low";

  const existing = await db
    .select()
    .from(scoringScales)
    .where(and(eq(scoringScales.projectId, projectId), eq(scoringScales.key, DEFAULT_KEY)))
    .limit(1);

  if (existing[0]) {
    // Optional: unarchive if it exists but was archived
    if (existing[0].archived === 1) {
      const [unarchived] = await db
        .update(scoringScales)
        .set({
          archived: 0,
          archivedOn: null,
          updatedOn: new Date().toISOString(),
        })
        .where(eq(scoringScales.id, existing[0].id))
        .returning();

      return unarchived;
    }

    return existing[0];
  }

  const now = new Date().toISOString();
  const scaleId = randomUUID();

  const createdScale = await db.transaction(async (tx) => {
    const [scale] = await tx
      .insert(scoringScales)
      .values({
        id: scaleId,
        projectId,
        name: DEFAULT_NAME,
        key: DEFAULT_KEY,
        sortOrder: 0,
        createdOn: now,
        updatedOn: now,
        archived: 0,
        archivedOn: null,
      })
      .returning();

    const options: NewScoringScaleOption[] = [
      { label: "High", value: 3, sortOrder: 0 },
      { label: "Medium", value: 2, sortOrder: 1 },
      { label: "Low", value: 1, sortOrder: 2 },
    ].map((o) => ({
      id: randomUUID(),
      scaleId,
      label: o.label,
      value: o.value,
      sortOrder: o.sortOrder ?? 0,
      createdOn: now,
      updatedOn: now,
      archived: 0,
      archivedOn: null,
    }));

    await tx.insert(scoringScaleOptions).values(options);

    return scale;
  });

  return createdScale;
}