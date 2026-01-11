// electron/preload.ts
// This file runs in the renderer process and sets up the IPC (Inter-Process Communication)
// bridge between the renderer and main Electron processes.
import { contextBridge, ipcRenderer } from "electron";

// Import type definitions for strong typing of IPC communication
import type { RouteKey, InputOf, OutputOf } from "../shared/ipc/types";
import type { IpcResult } from "../shared/ipc/result";
import { IPC } from "../shared/ipc/channels";

// Generic IPC invocation function that provides strong typing for all IPC calls
// K extends RouteKey ensures we can only call routes that exist in our IPC definition
async function invoke<K extends RouteKey>(
  channel: K,
  input: InputOf<K>
): Promise<IpcResult<OutputOf<K>>> {
  // Note: for routes whose input is `void`, pass `undefined` from the renderer.
  // The `as unknown` cast is needed because TypeScript can't always infer the exact type
  // but we know the input is valid based on the generic parameter K
  return ipcRenderer.invoke(channel, input as unknown);
}

// Expose the API to the main world (renderer process)
// This makes the API available in the global scope as `window.api`
contextBridge.exposeInMainWorld("api", {
  // Generic, strongly-typed IPC entrypoint
  // This is the base function that all other IPC calls go through
  invoke,

  // Convenience wrappers for projects-related operations
  projects: {
    list: () => invoke(IPC.projects.list as RouteKey, undefined as never),
    create: (input: InputOf<"projects:create">) =>
      invoke("projects:create", input),
    update: (input: InputOf<"projects:update">) =>
      invoke("projects:update", input),
  },

  // Convenience wrappers for drivers-related operations
  drivers: {
    listActiveByProject: (input: InputOf<"drivers:listActiveByProject">) =>
      invoke("drivers:listActiveByProject", input),
    listAllByProject: (input: InputOf<"drivers:listAllByProject">) =>
      invoke("drivers:listAllByProject", input),
    create: (input: InputOf<"drivers:create">) =>
      invoke("drivers:create", input),
    update: (input: InputOf<"drivers:update">) =>
      invoke("drivers:update", input),
  },

  driverScoringOption: {
    // create: (input: InputOf<"driverScoringOption:create">) =>
    //   invoke("driverScoringOption:create", input),
    delete: (input: InputOf<"driverScoringOption:delete">) =>
      invoke("driverScoringOption:delete", input),
  },

  scoringScaleOption: {
    listByDriver: (input: InputOf<"scoringScaleOption:listByDriver">) =>
      invoke("scoringScaleOption:listByDriver", input),
    create: (input: InputOf<"scoringScaleOption:create">) =>
      invoke("scoringScaleOption:create", input),
    update: (input: InputOf<"scoringScaleOption:update">) =>
      invoke("scoringScaleOption:update", input),
    delete: (input: InputOf<"scoringScaleOption:delete">) =>
      invoke("scoringScaleOption:delete", input),
  },

  items: {
    listByProject: (input: InputOf<"items:listByProject">) =>
      invoke("items:listByProject", input),
    create: (input: InputOf<"items:create">) => invoke("items:create", input),
    update: (input: InputOf<"items:update">) => invoke("items:update", input),
    updateAllItemScores: (input: { projectId: string }) =>
      invoke("items:updateAllItemScores", input),
  },

  itemScores: {
    listByItem: (input: InputOf<"itemScores:listByItem">) =>
      invoke("itemScores:listByItem", input),
    set: (input: InputOf<"itemScores:set">) => invoke("itemScores:set", input),
  },

  db: {
    exportBackup: () => invoke("db:exportBackup", null),
    importBackup: () => invoke("db:importBackup", null),
  },
});
