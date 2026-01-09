import { ipcMain } from "electron";
import { z } from "zod";
import { createIpcHandler } from "./_shared";
import * as driversRepo from "../repositories/drivers";
import {
  DriversListByProjectSchema,
  DriversCreateSchema,
  DriversUpdateSchema,DriverScoringOptionDeleteSchema
} from "../../shared/ipc/schemas";

export function registerDriversIpc() {
  ipcMain.handle(
    "drivers:listActiveByProject",
    createIpcHandler({
      schema: DriversListByProjectSchema,
      handler: async (_event, input) => {
        return driversRepo.listActiveDriversByProject(input.projectId);
      },
    })
  );

  ipcMain.handle(
    "drivers:listAllByProject",
    createIpcHandler({
      schema: DriversListByProjectSchema,
      handler: async (_event, input) => {
        return driversRepo.listAllDriversByProject(input.projectId);
      },
    })
  );

  ipcMain.handle(
    "drivers:create",
    createIpcHandler({
      schema: DriversCreateSchema,
      handler: async (_event, input) => {
        return driversRepo.createDriver(input);
      },
    })
  );

  ipcMain.handle(
    "drivers:update",
    createIpcHandler({
      schema: DriversUpdateSchema,
      handler: async (_event, input: { id: string }) => {
        return driversRepo.updateDriver(input);
      },
    })
  );

  ipcMain.handle(
    "driverScoringOption:delete",
    createIpcHandler({
      schema: DriverScoringOptionDeleteSchema,
      handler: async (_event, input) => {
        return driversRepo.deleteDriverScoringOptionLink(input);
      },
    })
  );
}
