// shared/ipc/channels.ts
export const IPC = {
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
} as const;

// Useful type: all channel strings
export type IpcChannel =
  | (typeof IPC.projects)[keyof typeof IPC.projects]
  | (typeof IPC.drivers)[keyof typeof IPC.drivers]
  | (typeof IPC.scoringScales)[keyof typeof IPC.scoringScales]
  | (typeof IPC.scoringScaleOption)[keyof typeof IPC.scoringScaleOption];
