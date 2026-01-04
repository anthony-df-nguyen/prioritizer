import { ipcMain } from "electron";
import { z } from "zod";
import { createIpcHandler } from "./_shared";
import * as itemsRepo from "../repositories/items.repo";
import {
  ItemsListByProjectSchema,
  ItemsCreateSchema,
  ItemsUpdateSchema,
  ItemScoresListByItemSchema,
  ItemScoresSetSchema,
} from "../../shared/ipc/schemas";

export function registerItemsIpc() {
  ipcMain.handle(
    "items:listByProject",
    createIpcHandler({
      schema: ItemsListByProjectSchema,
      handler: async (_event, input) => {
        return itemsRepo.listItemsByProject(input.projectId);
      },
    })
  );

  ipcMain.handle(
    "items:create",
    createIpcHandler({
      schema: ItemsCreateSchema,
      handler: async (_event, input) => {
        return itemsRepo.createItem(input);
      },
    })
  );

  ipcMain.handle(
    "items:update",
    createIpcHandler({
      schema: ItemsUpdateSchema,
      handler: async (_event, input) => {
        return itemsRepo.updateItem(input);
      },
    })
  );

  ipcMain.handle(
    "itemScores:listByItem",
    createIpcHandler({
      schema: ItemScoresListByItemSchema,
      handler: async (_event, input) => {
        return itemsRepo.listItemDriverScores(input.itemId);
      },
    })
  );

  ipcMain.handle(
    "itemScores:set",
    createIpcHandler({
      schema: ItemScoresSetSchema,
      handler: async (_event, input) => {
        return itemsRepo.setItemDriverScore(input);
      },
    })
  );
}
