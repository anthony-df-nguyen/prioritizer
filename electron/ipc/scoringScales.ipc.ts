import { ipcMain } from "electron";
import { z } from "zod";
import { createIpcHandler } from "./_shared";
import * as scoringScalesRepo from "../repositories/scoringScales.repo";
import {
  ScoringScalesCreateSchema,
  ScoringScalesUpdateSchema,
  ScoringScalesArchiveSchema,
} from "../../shared/ipc/schemas";

export function registerScoringScalesIPC() {
  ipcMain.handle(
    "scoringScales:listByProject",
    createIpcHandler({
      schema: z.object({ projectId: z.string().min(1) }),
      handler: async (_event, input) => {
        return scoringScalesRepo.listScoringScales(input.projectId);
      },
    })
  );

  ipcMain.handle(
    "scoringScales:create",
    createIpcHandler({
      schema: ScoringScalesCreateSchema,
      handler: async (_event, input) => {
        return scoringScalesRepo.createScoringScale(input);
      },
    })
  );

  ipcMain.handle(
    "scoringScales:update",
    createIpcHandler({
      schema: ScoringScalesUpdateSchema,
      handler: async (_event, input: {id: string}) => {
        return scoringScalesRepo.updateScoringScale(input);
      },
    })
  );

  ipcMain.handle(
    "scoringScales:archive",
    createIpcHandler({
      schema: ScoringScalesArchiveSchema,
      handler: async (_event, input: {id: string}) => {
        return scoringScalesRepo.archiveScoringScale(input.id);
      },
    })
  );
}
