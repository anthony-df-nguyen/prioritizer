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
    listByProject: (input: InputOf<"drivers:listByProject">) =>
      invoke("drivers:listByProject", input),
    create: (input: InputOf<"drivers:create">) =>
      invoke("drivers:create", input),
    update: (input: InputOf<"drivers:update">) =>
      invoke("drivers:update", input),
  },

  scoringScales: {
    listByProject: (input: InputOf<"scoringScales:listByProject">) =>
      invoke("scoringScales:listByProject", input),
    create: (input: InputOf<"scoringScales:create">) =>
      invoke("scoringScales:create", input),
    update: (input: InputOf<"scoringScales:update">) =>
      invoke("scoringScales:update", input),
    archive: (input: InputOf<"scoringScales:archive">) =>
      invoke("scoringScales:archive", input),
  },

  scoringScaleOption: {
    listByScale: (input: InputOf<"scoringScaleOption:listByScale">) =>
      invoke("scoringScaleOption:listByScale", input),
    create: (input: InputOf<"scoringScaleOption:create">) =>
      invoke("scoringScaleOption:create", input),
    update: (input: InputOf<"scoringScaleOption:update">) =>
      invoke("scoringScaleOption:update", input),
    delete: (input: InputOf<"scoringScaleOption:delete">) =>
      invoke("scoringScaleOption:delete", input),
  },
});
