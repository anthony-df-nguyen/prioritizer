"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// electron/preload.ts
// This file runs in the renderer process and sets up the IPC (Inter-Process Communication)
// bridge between the renderer and main Electron processes.
const electron_1 = require("electron");
const channels_1 = require("../shared/ipc/channels");
// Generic IPC invocation function that provides strong typing for all IPC calls
// K extends RouteKey ensures we can only call routes that exist in our IPC definition
async function invoke(channel, input) {
    // Note: for routes whose input is `void`, pass `undefined` from the renderer.
    // The `as unknown` cast is needed because TypeScript can't always infer the exact type
    // but we know the input is valid based on the generic parameter K
    return electron_1.ipcRenderer.invoke(channel, input);
}
// Expose the API to the main world (renderer process)
// This makes the API available in the global scope as `window.api`
electron_1.contextBridge.exposeInMainWorld("api", {
    // Generic, strongly-typed IPC entrypoint
    // This is the base function that all other IPC calls go through
    invoke,
    // Convenience wrappers for projects-related operations
    projects: {
        list: () => invoke(channels_1.IPC.projects.list, undefined),
        create: (input) => invoke("projects:create", input),
        update: (input) => invoke("projects:update", input),
    },
    // Convenience wrappers for drivers-related operations
    drivers: {
        listByProject: (input) => invoke("drivers:listByProject", input),
        create: (input) => invoke("drivers:create", input),
        update: (input) => invoke("drivers:update", input),
    },
    scoringScales: {
        listByProject: (input) => invoke("scoringScales:listByProject", input),
        create: (input) => invoke("scoringScales:create", input),
        update: (input) => invoke("scoringScales:update", input),
        archive: (input) => invoke("scoringScales:archive", input),
    },
    scoringScaleOption: {
        listByScale: (input) => invoke("scoringScaleOption:listByScale", input),
        create: (input) => invoke("scoringScaleOption:create", input),
        update: (input) => invoke("scoringScaleOption:update", input),
        delete: (input) => invoke("scoringScaleOption:delete", input),
    },
});
