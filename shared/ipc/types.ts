// shared/ipc/types.ts
import type { IpcRoutes } from "./routes";

export type RouteKey = keyof IpcRoutes;

export type InputOf<K extends RouteKey> = IpcRoutes[K]["input"];
export type OutputOf<K extends RouteKey> = IpcRoutes[K]["output"];