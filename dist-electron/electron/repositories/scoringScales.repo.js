"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listScoringScales = listScoringScales;
exports.createScoringScale = createScoringScale;
exports.updateScoringScale = updateScoringScale;
exports.archiveScoringScale = archiveScoringScale;
exports.ensureDefaultHmlScale = ensureDefaultHmlScale;
// electron/repositories/scoringScales.repo.ts
const db_1 = require("../../electron/db");
const schema_1 = require("../db/schema/");
const drizzle_orm_1 = require("drizzle-orm");
const crypto_1 = require("crypto");
async function listScoringScales(projectId) {
    return db_1.db
        .select()
        .from(schema_1.scoringScales)
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.scoringScales.projectId, projectId), (0, drizzle_orm_1.eq)(schema_1.scoringScales.archived, 0)))
        .orderBy((0, drizzle_orm_1.asc)(schema_1.scoringScales.sortOrder), (0, drizzle_orm_1.asc)(schema_1.scoringScales.name));
}
async function createScoringScale(input) {
    const now = new Date().toISOString();
    const [scale] = await db_1.db
        .insert(schema_1.scoringScales)
        .values({
        id: (0, crypto_1.randomUUID)(),
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
async function updateScoringScale(input) {
    const [scale] = await db_1.db
        .update(schema_1.scoringScales)
        .set({
        ...input,
        updatedOn: new Date().toISOString(),
    })
        .where((0, drizzle_orm_1.eq)(schema_1.scoringScales.id, input.id))
        .returning();
    return scale;
}
async function archiveScoringScale(id) {
    const now = new Date().toISOString();
    const [scale] = await db_1.db
        .update(schema_1.scoringScales)
        .set({
        archived: 1,
        archivedOn: now,
        updatedOn: now,
    })
        .where((0, drizzle_orm_1.eq)(schema_1.scoringScales.id, id))
        .returning();
    return scale;
}
/**
 * Ensures the default "High / Medium / Low" scale exists for a project, with options.
 * Safe to call repeatedly (idempotent).
 */
async function ensureDefaultHmlScale(projectId) {
    const DEFAULT_KEY = "HML_3_2_1";
    const DEFAULT_NAME = "High / Medium / Low";
    const existing = await db_1.db
        .select()
        .from(schema_1.scoringScales)
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.scoringScales.projectId, projectId), (0, drizzle_orm_1.eq)(schema_1.scoringScales.key, DEFAULT_KEY)))
        .limit(1);
    if (existing[0]) {
        // Optional: unarchive if it exists but was archived
        if (existing[0].archived === 1) {
            const [unarchived] = await db_1.db
                .update(schema_1.scoringScales)
                .set({
                archived: 0,
                archivedOn: null,
                updatedOn: new Date().toISOString(),
            })
                .where((0, drizzle_orm_1.eq)(schema_1.scoringScales.id, existing[0].id))
                .returning();
            return unarchived;
        }
        return existing[0];
    }
    const now = new Date().toISOString();
    const scaleId = (0, crypto_1.randomUUID)();
    const createdScale = await db_1.db.transaction(async (tx) => {
        const [scale] = await tx
            .insert(schema_1.scoringScales)
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
        const options = [
            { label: "High", value: 3, sortOrder: 0 },
            { label: "Medium", value: 2, sortOrder: 1 },
            { label: "Low", value: 1, sortOrder: 2 },
        ].map((o) => ({
            id: (0, crypto_1.randomUUID)(),
            scaleId,
            label: o.label,
            value: o.value,
            sortOrder: o.sortOrder ?? 0,
            createdOn: now,
            updatedOn: now,
            archived: 0,
            archivedOn: null,
        }));
        await tx.insert(schema_1.scoringScaleOptions).values(options);
        return scale;
    });
    return createdScale;
}
