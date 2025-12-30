import { registerProjectsIpc } from "./projects.ipc";
import { registerDriversIpc } from "./drivers.ipc";
import { registerScoringScalesIPC } from "./scoringScales.ipc";
import { registerScoringScaleOptionsIPC } from "./scoringScaleOptions.ipc";

export function registerIpcHandlers() {
  registerProjectsIpc();
  registerDriversIpc();
  registerScoringScalesIPC();
  registerScoringScaleOptionsIPC();
}