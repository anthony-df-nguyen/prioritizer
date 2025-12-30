"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listProjects = listProjects;
exports.createProject = createProject;
exports.updateProject = updateProject;
// electron/repositories/projects.repo.ts
const db_1 = require("../../electron/db");
const schema_1 = require("../db/schema/");
const drizzle_orm_1 = require("drizzle-orm");
const crypto_1 = require("crypto");
const scoringScales_repo_1 = require("./scoringScales.repo");
async function listProjects() {
    return db_1.db.select().from(schema_1.projects).where((0, drizzle_orm_1.eq)(schema_1.projects.archived, 0)).orderBy(schema_1.projects.name);
}
async function createProject(input) {
    const now = new Date().toISOString();
    const [project] = await db_1.db
        .insert(schema_1.projects)
        .values({
        id: (0, crypto_1.randomUUID)(),
        name: input.name,
        description: input.description ?? null,
        shortId: input.name.toLowerCase().replace(/\s+/g, "-"),
        createdOn: now,
        updatedOn: now,
        archived: 0,
    })
        .returning();
    await (0, scoringScales_repo_1.ensureDefaultHmlScale)(project.id);
    return project;
}
async function updateProject(input) {
    const [project] = await db_1.db
        .update(schema_1.projects)
        .set({
        ...input,
        updatedOn: new Date().toISOString(),
    })
        .where((0, drizzle_orm_1.eq)(schema_1.projects.id, input.id))
        .returning();
    return project;
}
