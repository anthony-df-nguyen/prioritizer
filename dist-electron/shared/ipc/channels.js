"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IPC = void 0;
// shared/ipc/channels.ts
exports.IPC = {
    projects: {
        list: "projects:list",
        create: "projects:create",
        update: "projects:update",
    },
    drivers: {
        listByProject: "drivers:listByProject",
        create: "drivers:create",
        update: "drivers:update",
    },
    scoringScales: {
        listByProject: "scoringScales:listByProject",
        create: "scoringScales:create",
        update: "scoringScales:update",
        archive: "scoringScales:archive",
    },
    scoringScaleOption: {
        listByScale: "scoringScaleOption:listByScale",
        create: "scoringScaleOption:create",
        update: "scoringScaleOption:update",
        delete: "scoringScaleOption:delete",
    },
};
