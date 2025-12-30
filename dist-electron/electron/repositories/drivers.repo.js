"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listDriversByProject = listDriversByProject;
exports.createDriver = createDriver;
exports.updateDriver = updateDriver;
// electron/repositories/drivers.repo.ts
const db_1 = require("../db/");
const schema_1 = require("../db/schema/");
const drizzle_orm_1 = require("drizzle-orm");
const crypto_1 = require("crypto");
async function listDriversByProject(projectId) {
    console.log("listDriversByProject v2", Date.now());
    return db_1.db
        .select()
        .from(schema_1.decisionDrivers)
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.decisionDrivers.projectId, projectId), (0, drizzle_orm_1.eq)(schema_1.decisionDrivers.archived, 0)))
        .orderBy(((0, drizzle_orm_1.asc)(schema_1.decisionDrivers.name)));
}
async function createDriver(input) {
    const now = new Date().toISOString();
    const [driver] = await db_1.db
        .insert(schema_1.decisionDrivers)
        .values({
        id: (0, crypto_1.randomUUID)(),
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
async function updateDriver(input) {
    const [driver] = await db_1.db
        .update(schema_1.decisionDrivers)
        .set({
        ...input,
        updatedOn: new Date().toISOString(),
    })
        .where((0, drizzle_orm_1.eq)(schema_1.decisionDrivers.id, input.id))
        .returning();
    return driver;
}
