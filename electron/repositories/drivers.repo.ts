// electron/repositories/drivers.repo.ts
import { db } from "../db/";
import {
  decisionDrivers,
  type NewDecisionDriver,
  type DecisionDriver,
} from "../db/schema/";
import { eq, and, asc } from "drizzle-orm";
import { randomUUID } from "crypto";

export async function listDriversByProject(
  projectId: string
): Promise<DecisionDriver[]> {
  console.log("listDriversByProject v2", Date.now())
  return db
    .select()
    .from(decisionDrivers)
    .where(
      and(
        eq(decisionDrivers.projectId, projectId),
        eq(decisionDrivers.archived, 0)
      )
    )
    .orderBy((asc(decisionDrivers.name)));
} 

export async function createDriver(
  input: Pick<
    NewDecisionDriver,
    "projectId" | "name" | "weight" | "scaleId" | "description"
  >
): Promise<DecisionDriver> {
  const now = new Date().toISOString();

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

  return driver;
}

export async function updateDriver(
  input: Partial<DecisionDriver> & Pick<DecisionDriver, "id">
): Promise<DecisionDriver> {
  const [driver] = await db
    .update(decisionDrivers)
    .set({
      ...input,
      updatedOn: new Date().toISOString(),
    })
    .where(eq(decisionDrivers.id, input.id))
    .returning();

  return driver;
}
