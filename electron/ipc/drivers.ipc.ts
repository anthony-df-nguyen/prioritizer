import { ipcMain } from "electron";
import { z } from "zod";
import { createIpcHandler } from "./_shared";
import * as driversRepo from "../repositories/drivers.repo";
import {DriversListByProjectSchema, DriversCreateSchema,DriversUpdateSchema} from "../../shared/ipc/schemas"

export function registerDriversIpc() {
  ipcMain.handle(
    "drivers:listByProject",
    createIpcHandler({
      schema: DriversListByProjectSchema,
      handler: async (_event, input) => {
        return driversRepo.listDriversByProject(input.projectId);
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
      handler: async (_event, input: {id: string}) => {
        return driversRepo.updateDriver(input);
      },
    })
  );
}