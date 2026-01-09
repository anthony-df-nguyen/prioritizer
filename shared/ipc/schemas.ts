// shared/ipc/schemas.ts
import { z } from "zod";

// Projects
export const ProjectsCreateSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional().nullable(),
});

export const ProjectsUpdateSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).optional(),
  shortId: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  archived: z.number().int().optional(),
});

// Drivers
export const DriversListByProjectSchema = z.object({
  projectId: z.string().min(1),
});

export const DriversCreateSchema = z.object({
  projectId: z.string().min(1),
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional().nullable(),
  weight: z.number().int(),
  sortOrder: z.number().int().optional(),
  scoringOptions: z
    .array(
      z.object({
        label: z.string().min(1),
        value: z.number().int(),
        sortOrder: z.number().int(),
        id: z.string().min(1).optional(),
      })
    )
    .optional(),
});

export const DriversUpdateSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  weight: z.number().int().optional(),
  archived: z.number().int().optional(),
  scoringOptions: z
    .array(
      z.object({
        label: z.string().min(1),
        value: z.number().int(),
        sortOrder: z.number().int(),
        id: z.string().min(1).optional(),
      })
    )
    .optional(),
});

// Driver Scoring Option Link
// export const DriverScoringOptionCreateSchema = z.object({
//   driverId: z.string().min(1),
//   scoringOptionId: z.string().min(1),
// });
export const DriverScoringOptionDeleteSchema = z.object({
  driverId: z.string().min(1),
  scoringOptionId: z.string().min(1),
});

// Scoring Scale Options
export const ScoringScaleOptionsListByDriverSchema = z.object({
  driverId: z.string().min(1),
});

export const ScoringScaleOptionsCreateSchema = z.object({
  label: z.string().min(1),
  value: z.number().int(),
  sortOrder: z.number().int().optional(),
});

export const ScoringScaleOptionsUpdateSchema = z.object({
  id: z.string().min(1),
  driverId: z.string().min(1).optional(),
  label: z.string().min(1).optional(),
  value: z.number().int().optional(),
  sortOrder: z.number().int().optional(),
});

export const ScoringScaleOptionsDeleteSchema = z.object({
  id: z.string().min(1),
});

// Items
export const ItemsListByProjectSchema = z.object({
  projectId: z.string().min(1),
});

export const ItemsCreateSchema = z.object({
  projectId: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional().nullable(),
});

export const ItemsUpdateSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  archived: z.number().int().optional(),
});

// Item Driver Scores
export const ItemScoresListByItemSchema = z.object({
  itemId: z.string(),
});

export const ItemScoresSetSchema = z.object({
  itemId: z.string(),
  driverId: z.string(),
  scoringScaleOptionId: z.string().nullable(),
  value: z.number().nullable(),
});

export const UpdateAllItemScores = z.object({
  projectId: z.string(),
});
