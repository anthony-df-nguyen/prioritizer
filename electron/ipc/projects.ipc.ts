import { ipcMain } from "electron";
import { z } from "zod";
import { createIpcHandler } from "./_shared";
import * as projectsRepo from "../repositories/projects.repo";
import {ProjectsCreateSchema, ProjectsUpdateSchema} from "../../shared/ipc/schemas"


export function registerProjectsIpc() {
  ipcMain.handle(
    "projects:list",
    createIpcHandler({
      handler: async () => {
        return projectsRepo.listProjects();
      },
    })
  );

  ipcMain.handle(
    "projects:create",
    createIpcHandler({
      schema: ProjectsCreateSchema,
      handler: async (_event, input) => {
        return projectsRepo.createProject(input);
      },
    })
  );

  ipcMain.handle(
    "projects:update",
    createIpcHandler({
      schema: ProjectsUpdateSchema,
      handler: async (_event, input: {id: string}) => {
        return projectsRepo.updateProject(input);
      },
    })
  );
}