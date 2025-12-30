"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerScoringScaleOptionsIPC = registerScoringScaleOptionsIPC;
const electron_1 = require("electron");
const _shared_1 = require("./_shared");
const optionsRepo = __importStar(require("../repositories/scoringScaleOptions.repo"));
const schemas_1 = require("../../shared/ipc/schemas");
function registerScoringScaleOptionsIPC() {
    electron_1.ipcMain.handle("scoringScaleOption:listByScale", (0, _shared_1.createIpcHandler)({
        schema: schemas_1.ScoringScaleOptionsListSchema,
        handler: async (_event, input) => {
            return optionsRepo.listScoringScaleOptions(input.scaleId);
        },
    }));
    electron_1.ipcMain.handle("scoringScaleOption:create", (0, _shared_1.createIpcHandler)({
        schema: schemas_1.ScoringScaleOptionsCreateSchema,
        handler: async (_event, input) => {
            return optionsRepo.createScoringScaleOption(input);
        },
    }));
    electron_1.ipcMain.handle("scoringScaleOption:update", (0, _shared_1.createIpcHandler)({
        schema: schemas_1.ScoringScaleOptionsUpdateSchema,
        handler: async (_event, input) => {
            return optionsRepo.updateScoringScaleOption(input);
        },
    }));
    electron_1.ipcMain.handle("scoringScaleOption:delete", (0, _shared_1.createIpcHandler)({
        schema: schemas_1.ScoringScaleOptionsDeleteSchema,
        handler: async (_event, input) => {
            return optionsRepo.deleteScoringScaleOption(input.id);
        },
    }));
}
