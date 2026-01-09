import { registerProjectsIpc } from "./projects.ipc";
import { registerDriversIpc } from "./drivers.ipc";
import { registerScoringScaleOptionsIPC } from "./scoringScaleOptions.ipc";
import {registerItemsIpc} from "./items.ipc"

export function registerIpcHandlers() {
  registerProjectsIpc();
  registerDriversIpc();
  registerScoringScaleOptionsIPC();
  registerItemsIpc();
}