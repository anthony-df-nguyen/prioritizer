// electron/repositories/projects.repo.ts
import { db } from "../../electron/db";
import { projects, type NewProject, type Project } from "../db/schema/";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import { ensureDefaultHmlScale } from "./scoringScales.repo";

export async function listProjects(): Promise<Project[]> {
  return db.select().from(projects).where(eq(projects.archived, 0)).orderBy(projects.name);
}

export async function createProject(
  input: Pick<NewProject, "name" | "description">
): Promise<Project> {
  const now = new Date().toISOString();

  const [project] = await db
    .insert(projects)
    .values({
      id: randomUUID(),
      name: input.name,
      description: input.description ?? null,
      shortId: input.name.toLowerCase().replace(/\s+/g, "-"),
      createdOn: now,
      updatedOn: now,
      archived: 0,
    })
    .returning();
  await ensureDefaultHmlScale(project.id);

  return project;
}

export async function updateProject(
  input: Partial<Project> & Pick<Project, "id">
): Promise<Project> {
  const [project] = await db
    .update(projects)
    .set({
      ...input,
      updatedOn: new Date().toISOString(),
    })
    .where(eq(projects.id, input.id))
    .returning();

  return project;
}
