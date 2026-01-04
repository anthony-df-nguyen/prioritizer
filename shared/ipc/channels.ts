// shared/ipc/channels.ts
export const IPC = {
  projects: {
    list: "projects:list",
    create: "projects:create",
    update: "projects:update",
  },
  drivers: {
    listActiveByProject: "drivers:listActiveByProject",
    listAllByProject: "drivers:listAllByProject",
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
  items: {
    listByProject: "items:listByProject",
    create: "items:create",
    update: "items:update",
  },
  itemScores: {
    listByItem: "itemScores:listByItem",
    set: "itemScores:set",
  },
} as const;

// Useful type: all channel strings
export type IpcChannel =
  | (typeof IPC.projects)[keyof typeof IPC.projects]
  | (typeof IPC.drivers)[keyof typeof IPC.drivers]
  | (typeof IPC.scoringScales)[keyof typeof IPC.scoringScales]
  | (typeof IPC.scoringScaleOption)[keyof typeof IPC.scoringScaleOption]
  | (typeof IPC.items)[keyof typeof IPC.items]
  | (typeof IPC.itemScores)[keyof typeof IPC.itemScores];
