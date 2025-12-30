// shared/ipc/unwrap.ts
import type { IpcResult } from "./result";

export function unwrapIpcResult<T>(res: IpcResult<T>): T {
  if (!res.ok) {
    throw new Error(res.error.message);
  }
  return res.data;
}