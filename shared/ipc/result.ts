// shared/ipc/result.ts

export type IpcOk<T> = {
  ok: true;
  data: T;
};

export type IpcErr = {
  ok: false;
  error: {
    code: "VALIDATION_ERROR" | "INTERNAL_ERROR";
    message: string;
    details?: unknown;
  };
};

export type IpcResult<T> = IpcOk<T> | IpcErr;