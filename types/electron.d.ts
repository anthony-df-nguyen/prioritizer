import type { RouteKey, InputOf, OutputOf } from "../shared/ipc/routes";
import type { IpcResult } from "../shared/ipc/result";

type Invoke = <K extends RouteKey>(
  channel: K,
  input: InputOf<K>
) => Promise<IpcResult<OutputOf<K>>>;

declare global {
  interface Window {
    api: {
      invoke: Invoke;

      // you can keep wrappers but type them with Invoke’s OutputOf/InputOf
      projects: {
        list: () => ReturnType<Invoke>;
        create: (
          input: InputOf<"projects:create">
        ) => Promise<IpcResult<OutputOf<"projects:create">>>;
        update: (
          input: InputOf<"projects:update">
        ) => Promise<IpcResult<OutputOf<"projects:update">>>;
      };

      drivers: {
        listActiveByProject: (
          input: InputOf<"drivers:listActiveByProject">
        ) => Promise<IpcResult<OutputOf<"drivers:listActiveByProject">>>;
        listAllByProject: (
          input: InputOf<"drivers:listAllByProject">
        ) => Promise<IpcResult<OutputOf<"drivers:listAllByProject">>>;
        create: (
          input: InputOf<"drivers:create">
        ) => Promise<IpcResult<OutputOf<"drivers:create">>>;
        update: (
          input: InputOf<"drivers:update">
        ) => Promise<IpcResult<OutputOf<"drivers:update">>>;
      };

      driverScoringOption: {
        // create: (
        //   input: InputOf<"driverScoringOption:create">
        // ) => Promise<IpcResult<OutputOf<"driverScoringOption:create">>>;
        delete: (
          input: InputOf<"driverScoringOption:delete">
        ) => Promise<IpcResult<OutputOf<"driverScoringOption:delete">>>;
      };
      scoringScaleOption: {
        listByDriver: (
          input: InputOf<"scoringScaleOption:listByDriver">
        ) => Promise<IpcResult<OutputOf<"scoringScaleOption:listByDriver">>>;
        create: (
          input: InputOf<"scoringScaleOption:create">
        ) => Promise<IpcResult<OutputOf<"scoringScaleOption:create">>>;
        update: (
          input: InputOf<"scoringScaleOption:update">
        ) => Promise<IpcResult<OutputOf<"scoringScaleOption:update">>>;
        delete: (
          input: InputOf<"scoringScaleOption:delete">
        ) => Promise<IpcResult<OutputOf<"scoringScaleOption:delete">>>;
      };

      items: {
        listByProject: (
          input: InputOf<"items:listByProject">
        ) => Promise<IpcResult<OutputOf<"items:listByProject">>>;
        create: (
          input: InputOf<"items:create">
        ) => Promise<IpcResult<OutputOf<"items:create">>>;
        update: (
          input: InputOf<"items:update">
        ) => Promise<IpcResult<OutputOf<"items:update">>>;
        updateAllItemScores: (input: { projectId: string }) => Promise<void>;
      };

      itemScores: {
        listByItem: (
          input: InputOf<"itemScores:listByItem">
        ) => Promise<IpcResult<OutputOf<"itemScores:listByItem">>>;
        set: (
          input: InputOf<"itemScores:set">
        ) => Promise<IpcResult<OutputOf<"itemScores:set">>>;
      };

      db: {
        exportBackup: (input: null) => void;
        importBackup: (input: null) => void;
      };

      ping: () => Promise<string>;
    };
  }
}

export {};
