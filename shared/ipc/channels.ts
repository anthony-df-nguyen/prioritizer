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
  driverScoringOption: {
    create: "driverScoringOption:create",
    delete: "driverScoringOption:delete",
  },
  scoringScaleOption: {
    listByDriver: "scoringScaleOption:listByDriver",
    create: "scoringScaleOption:create",
    update: "scoringScaleOption:update",
    delete: "scoringScaleOption:delete",
  },
  items: {
    listByProject: "items:listByProject",
    create: "items:create",
    update: "items:update",
    updateAllItemScores: "items:updateAllScores",
  },
  itemScores: {
    listByItem: "itemScores:listByItem",
    set: "itemScores:set",
  },
  db: {
    exportBackup: "db:exportBackup",
    importBackup: "db:importBackup",
    delete: "db:delete",
  },
} as const;

// Useful type: all channel strings
export type IpcChannel =
  | (typeof IPC.projects)[keyof typeof IPC.projects]
  | (typeof IPC.drivers)[keyof typeof IPC.drivers]
  | (typeof IPC.driverScoringOption)[keyof typeof IPC.driverScoringOption]
  | (typeof IPC.scoringScaleOption)[keyof typeof IPC.scoringScaleOption]
  | (typeof IPC.items)[keyof typeof IPC.items]
  | (typeof IPC.itemScores)[keyof typeof IPC.itemScores]
  | (typeof IPC.db)[keyof typeof IPC.db];
