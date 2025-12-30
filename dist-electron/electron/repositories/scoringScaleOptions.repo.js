"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listScoringScaleOptions = listScoringScaleOptions;
exports.createScoringScaleOption = createScoringScaleOption;
exports.updateScoringScaleOption = updateScoringScaleOption;
exports.deleteScoringScaleOption = deleteScoringScaleOption;
// electron/repositories/scoringScaleOptions.repo.ts
const db_1 = require("../../electron/db");
const schema_1 = require("../db/schema/");
const drizzle_orm_1 = require("drizzle-orm");
const crypto_1 = require("crypto");
async function listScoringScaleOptions(scaleId) {
    return db_1.db
        .select()
        .from(schema_1.scoringScaleOptions)
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.scoringScaleOptions.scaleId, scaleId)))
        .orderBy((0, drizzle_orm_1.desc)(schema_1.scoringScaleOptions.value), (0, drizzle_orm_1.asc)(schema_1.scoringScaleOptions.label));
}
async function createScoringScaleOption(input) {
    const now = new Date().toISOString();
    const [option] = await db_1.db
        .insert(schema_1.scoringScaleOptions)
        .values({
        id: (0, crypto_1.randomUUID)(),
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
async function updateScoringScaleOption(input) {
    const [option] = await db_1.db
        .update(schema_1.scoringScaleOptions)
        .set({
        ...input,
        updatedOn: new Date().toISOString(),
    })
        .where((0, drizzle_orm_1.eq)(schema_1.scoringScaleOptions.id, input.id))
        .returning();
    return option;
}
async function deleteScoringScaleOption(id) {
    const [option] = await db_1.db
        .delete(schema_1.scoringScaleOptions)
        .where((0, drizzle_orm_1.eq)(schema_1.scoringScaleOptions.id, id))
        .returning();
    return option;
}
