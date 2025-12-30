import { ipcMain } from "electron";
import { createIpcHandler } from "./_shared";
import * as optionsRepo from "../repositories/scoringScaleOptions.repo";
import {
  ScoringScaleOptionsListSchema,
  ScoringScaleOptionsCreateSchema,
  ScoringScaleOptionsUpdateSchema,
  ScoringScaleOptionsDeleteSchema,
} from "../../shared/ipc/schemas";

export function registerScoringScaleOptionsIPC() {
ipcMain.handle(
    "scoringScaleOption:listByScale",
    createIpcHandler({
      schema: ScoringScaleOptionsListSchema,
      handler: async (_event, input) => {
        return optionsRepo.listScoringScaleOptions(input.scaleId);
      },
    })
  );

  ipcMain.handle(
    "scoringScaleOption:create",
    createIpcHandler({
      schema: ScoringScaleOptionsCreateSchema,
      handler: async (_event, input) => {
        return optionsRepo.createScoringScaleOption(input);
      },
    })
  );

  ipcMain.handle(
    "scoringScaleOption:update",
    createIpcHandler({
      schema: ScoringScaleOptionsUpdateSchema,
      handler: async (_event, input: {id: string}) => {
        return optionsRepo.updateScoringScaleOption(input);
      },
    })
  );

  ipcMain.handle(
    "scoringScaleOption:delete",
    createIpcHandler({
      schema: ScoringScaleOptionsDeleteSchema,
      handler: async (_event, input: {id: string}) => {
        return optionsRepo.deleteScoringScaleOption(input.id);
      },
    })
  );
}
