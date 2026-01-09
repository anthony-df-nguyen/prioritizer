import { ipcMain } from "electron";
import { createIpcHandler } from "./_shared";
import * as optionsRepo from "../repositories/scoringScaleOptions.repo";
import {
  ScoringScaleOptionsListByDriverSchema,
  ScoringScaleOptionsCreateSchema,
  ScoringScaleOptionsUpdateSchema,
  ScoringScaleOptionsDeleteSchema,
} from "../../shared/ipc/schemas";

export function registerScoringScaleOptionsIPC() {
  ipcMain.handle(
    "scoringScaleOption:listByDriver",
    createIpcHandler({
      schema: ScoringScaleOptionsListByDriverSchema,
      handler: async (_event, input) => {
        return optionsRepo.listScoringScaleOptionsByDriver(input.driverId);
      },
    })
  );

  ipcMain.handle(
    "scoringScaleOption:create",
    createIpcHandler({
      schema: ScoringScaleOptionsCreateSchema,
      handler: async (_event, input) => {
        // Remove projectId from input before passing to repo
        const {...rest } = input;
        return optionsRepo.createScoringScaleOption(rest);
      },
    })
  );

  ipcMain.handle(
    "scoringScaleOption:update",
    createIpcHandler({
      schema: ScoringScaleOptionsUpdateSchema,
      handler: async (_event, input) => {
        return optionsRepo.updateScoringScaleOption(input);
      },
    })
  );

  ipcMain.handle(
    "scoringScaleOption:delete",
    createIpcHandler({
      schema: ScoringScaleOptionsDeleteSchema,
      handler: async (_event, input) => {
        return optionsRepo.deleteScoringScaleOption(input);
      },
    })
  );
}