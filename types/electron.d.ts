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
        create: (input: InputOf<"projects:create">) => Promise<IpcResult<OutputOf<"projects:create">>>;
        update: (input: InputOf<"projects:update">) => Promise<IpcResult<OutputOf<"projects:update">>>;
      };

      drivers: {
        listByProject: (input: InputOf<"drivers:listByProject">) => Promise<IpcResult<OutputOf<"drivers:listByProject">>>;
        create: (input: InputOf<"drivers:create">) => Promise<IpcResult<OutputOf<"drivers:create">>>;
        update: (input: InputOf<"drivers:update">) => Promise<IpcResult<OutputOf<"drivers:update">>>;
      };

      scoringScales: {
        listByProject: (input: InputOf<"scoringScales:listByProject">) => Promise<IpcResult<OutputOf<"scoringScales:listByProject">>>;
        create: (input: InputOf<"scoringScales:create">) => Promise<IpcResult<OutputOf<"scoringScales:create">>>;
        update: (input: InputOf<"scoringScales:update">) => Promise<IpcResult<OutputOf<"scoringScales:update">>>;
        archive: (input: InputOf<"scoringScales:archive">) => Promise<IpcResult<OutputOf<"scoringScales:archive">>>;
      };

      scoringScaleOption: {
        listByScale: (input: InputOf<"scoringScaleOption:listByScale">) => Promise<IpcResult<OutputOf<"scoringScaleOptions:listByScale">>>;
        create: (input: InputOf<"scoringScaleOption:create">) => Promise<IpcResult<OutputOf<"scoringScaleOption:create">>>;
        update: (input: InputOf<"scoringScaleOption:update">) => Promise<IpcResult<OutputOf<"scoringScaleOption:update">>>;
        delete: (input: InputOf<"scoringScaleOption:delete">) => Promise<IpcResult<OutputOf<"scoringScaleOption:delete">>>;
      };

      ping: () => Promise<string>;
    };
  }
}

export {};