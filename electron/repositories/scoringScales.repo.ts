// electron/repositories/scoringScales.repo.ts
import { db } from "../../electron/db";
import {
  scoringScales,
  scoringScaleOptions,
  type NewScoringScale,
  type ScoringScale,
  type NewScoringScaleOption,
} from "../db/schema/";
import { and, asc, eq, inArray } from "drizzle-orm";
import { randomUUID } from "crypto";

export async function listScoringScales(
  projectId: string
): Promise<ScoringScale[]> {
  return db
    .select()
    .from(scoringScales)
    .where(
      and(eq(scoringScales.projectId, projectId), eq(scoringScales.archived, 0))
    )
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
 * Ensures the default HML scales exist for a project, with options.
 * Safe to call repeatedly (idempotent).
 *
 * - HML_3_2_1: High=3, Medium=2, Low=1 (Higher is Better)
 * - HML_1_2_3: High=1, Medium=2, Low=3 (Lower is Better)
 */
export async function ensureDefaultHmlScale(
  projectId: string
): Promise<ScoringScale | undefined> {
  const now = new Date().toISOString();

  const defs = [
    {
      key: "HML_3_2_1",
      name: "High–Medium–Low (Higher is Better)",
      description:
        "Use this scale when higher ratings indicate more desirable outcomes. Items scored as High will contribute more positively to overall priority.",
      sortOrder: 0,
      options: [
        { label: "High", value: 3, sortOrder: 0 },
        { label: "Medium", value: 2, sortOrder: 1 },
        { label: "Low", value: 1, sortOrder: 2 },
      ],
    },
    {
      key: "HML_1_2_3",
      name: "High–Medium–Low (Lower is Better)",
      description:
        "Use this scale when lower ratings indicate more desirable outcomes. Items scored as Low will contribute more positively to overall priority.",
      sortOrder: 0,
      options: [
        { label: "High", value: 1, sortOrder: 2 },
        { label: "Medium", value: 2, sortOrder: 1 },
        { label: "Low", value: 3, sortOrder: 0 },
      ],
    },
  ] as const;

  // We keep the previous behavior of returning the Higher-is-better scale.
  let higherScale: ScoringScale | undefined;

  await db.transaction(async (tx) => {
    const keys = defs.map((d) => d.key);

    const existing = await tx
      .select()
      .from(scoringScales)
      .where(
        and(
          eq(scoringScales.projectId, projectId),
          inArray(scoringScales.key, keys as unknown as string[])
        )
      );

    const existingByKey = new Map(existing.map((s) => [s.key, s]));

    for (const def of defs) {
      const found = existingByKey.get(def.key) as ScoringScale | undefined;

      // If it exists but was archived, unarchive it.
      if (found) {
        if (found.archived === 1) {
          const [unarchived] = await tx
            .update(scoringScales)
            .set({
              archived: 0,
              archivedOn: null,
              updatedOn: new Date().toISOString(),
            })
            .where(eq(scoringScales.id, found.id))
            .returning();

          if (def.key === "HML_3_2_1") higherScale = unarchived;
        } else {
          if (def.key === "HML_3_2_1") higherScale = found;
        }

        // NOTE: We intentionally do not try to re-create options here.
        // If you want option self-healing later, we can add a check.
        continue;
      }

      // Missing: create scale + options.
      const scaleId = randomUUID();
      const [createdScale] = await tx
        .insert(scoringScales)
        .values({
          id: scaleId,
          projectId,
          name: def.name,
          key: def.key,
          description: def.description,
          sortOrder: def.sortOrder,
          createdOn: now,
          updatedOn: now,
          archived: 0,
          archivedOn: null,
        })
        .returning();

      const options: NewScoringScaleOption[] = def.options.map((o) => ({
        id: randomUUID(),
        scaleId,
        label: o.label,
        value: o.value,
        sortOrder: o.sortOrder,
        createdOn: now,
        updatedOn: now,
        archived: 0,
        archivedOn: null,
      }));

      await tx.insert(scoringScaleOptions).values(options);

      if (def.key === "HML_3_2_1") higherScale = createdScale;
    }
  });

  return higherScale;
}
