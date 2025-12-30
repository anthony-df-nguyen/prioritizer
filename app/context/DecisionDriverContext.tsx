"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { unwrapIpcResult } from "@/shared/ipc/unwrap";
import { OutputOf } from "@/shared/ipc/types";
import { useProjects } from "./ProjectContext";

// Minimal Driver shape (matches your drizzle schema fields used by the UI)
type Driver = OutputOf<"drivers:listByProject">[number];

type DriverContextValue = {
  // What drivers exist for the active project
  drivers: Driver[];

  // Helpful UI flags
  isLoading: boolean;
  error: string | null;
  hasDrivers: boolean;

  // Reload from DB
  refreshDrivers: () => Promise<void>;
};

const DriverContext = createContext<DriverContextValue | null>(null);

const fetchDrivers = async (projectId: string): Promise<Driver[]> => {
  const res = await window.api.drivers.listByProject({ projectId });
  return unwrapIpcResult(res);
};

export function DriverProvider({ children }: { children: ReactNode }) {
  const { activeProjectId } = useProjects();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  //console.log('drivers: ', drivers);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refreshDrivers = useCallback(async () => {
    if (!activeProjectId) {
      setDrivers([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const list = await fetchDrivers(activeProjectId);
      setDrivers(list);
    } catch (e) {
      setDrivers([]);
      setError("Failed to load drivers");
    } finally {
      setIsLoading(false);
    }
  }, [activeProjectId]);

  // Initial load and when active project changes
  useEffect(() => {
    void refreshDrivers();
  }, [activeProjectId, refreshDrivers]);

  const value = useMemo<DriverContextValue>(
    () => ({
      drivers,
      isLoading,
      error,
      hasDrivers: drivers.length > 0,
      refreshDrivers,
    }),
    [drivers, isLoading, error, refreshDrivers]
  );

  return (
    <DriverContext.Provider value={value}>{children}</DriverContext.Provider>
  );
}

export function useDrivers() {
  const ctx = useContext(DriverContext);
  if (!ctx) {
    throw new Error("useDrivers must be used within a <DriverProvider>");
  }
  return ctx;
}