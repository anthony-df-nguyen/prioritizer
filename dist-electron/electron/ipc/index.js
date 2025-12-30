"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerIpcHandlers = registerIpcHandlers;
const projects_ipc_1 = require("./projects.ipc");
const drivers_ipc_1 = require("./drivers.ipc");
const scoringScales_ipc_1 = require("./scoringScales.ipc");
const scoringScaleOptions_ipc_1 = require("./scoringScaleOptions.ipc");
function registerIpcHandlers() {
    (0, projects_ipc_1.registerProjectsIpc)();
    (0, drivers_ipc_1.registerDriversIpc)();
    (0, scoringScales_ipc_1.registerScoringScalesIPC)();
    (0, scoringScaleOptions_ipc_1.registerScoringScaleOptionsIPC)();
}
