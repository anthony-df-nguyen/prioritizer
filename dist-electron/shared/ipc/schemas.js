"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScoringScaleOptionsDeleteSchema = exports.ScoringScaleOptionsUpdateSchema = exports.ScoringScaleOptionsCreateSchema = exports.ScoringScaleOptionsListSchema = exports.ScoringScalesArchiveSchema = exports.ScoringScalesUpdateSchema = exports.ScoringScalesCreateSchema = exports.DriversUpdateSchema = exports.DriversCreateSchema = exports.DriversListByProjectSchema = exports.ProjectsUpdateSchema = exports.ProjectsCreateSchema = void 0;
// shared/ipc/schemas.ts
const zod_1 = require("zod");
// Projects
exports.ProjectsCreateSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    description: zod_1.z.string().optional().nullable(),
});
exports.ProjectsUpdateSchema = zod_1.z.object({
    id: zod_1.z.string().min(1),
    name: zod_1.z.string().min(1).optional(),
    shortId: zod_1.z.string().min(1).optional(),
    description: zod_1.z.string().optional().nullable(),
    archived: zod_1.z.number().int().optional(),
});
// Drivers
exports.DriversListByProjectSchema = zod_1.z.object({
    projectId: zod_1.z.string().min(1),
});
exports.DriversCreateSchema = zod_1.z.object({
    projectId: zod_1.z.string().min(1),
    name: zod_1.z.string().min(1),
    description: zod_1.z.string().optional().nullable(),
    scaleId: zod_1.z.string().min(1),
    weight: zod_1.z.number().int(),
    sortOrder: zod_1.z.number().int().optional(),
});
exports.DriversUpdateSchema = zod_1.z.object({
    id: zod_1.z.string().min(1),
    name: zod_1.z.string().min(1).optional(),
    description: zod_1.z.string().optional().nullable(),
    weight: zod_1.z.number().int().optional(),
    archived: zod_1.z.number().int().optional(),
});
// Scoring Scales
exports.ScoringScalesCreateSchema = zod_1.z.object({
    projectId: zod_1.z.string().min(1),
    name: zod_1.z.string().min(1),
    description: zod_1.z.string().optional().nullable(),
    key: zod_1.z.string().optional().nullable(),
    sortOrder: zod_1.z.number().int().optional(),
    archived: zod_1.z.number().int().optional(),
});
exports.ScoringScalesUpdateSchema = zod_1.z.object({
    id: zod_1.z.string().min(1),
    projectId: zod_1.z.string().min(1).optional(),
    name: zod_1.z.string().min(1).optional(),
    description: zod_1.z.string().optional().nullable(),
    key: zod_1.z.string().optional().nullable(),
    sortOrder: zod_1.z.number().int().optional(),
    archived: zod_1.z.number().int().optional(),
});
exports.ScoringScalesArchiveSchema = zod_1.z.object({
    id: zod_1.z.string().min(1),
});
// Scoring Scale Options
exports.ScoringScaleOptionsListSchema = zod_1.z.object({
    scaleId: zod_1.z.string().min(1),
});
exports.ScoringScaleOptionsCreateSchema = zod_1.z.object({
    scaleId: zod_1.z.string().min(1),
    label: zod_1.z.string().min(1),
    value: zod_1.z.number().int(),
    sortOrder: zod_1.z.number().int().optional(),
});
exports.ScoringScaleOptionsUpdateSchema = zod_1.z.object({
    id: zod_1.z.string().min(1),
    scaleId: zod_1.z.string().min(1).optional(),
    label: zod_1.z.string().min(1).optional(),
    value: zod_1.z.number().int().optional(),
    sortOrder: zod_1.z.number().int().optional(),
});
exports.ScoringScaleOptionsDeleteSchema = zod_1.z.object({
    id: zod_1.z.string().min(1),
});
