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
import { DecisionDriver, ScoringScaleOption } from "@/electron/db/schema";
import { useProjects } from "./ProjectContext";

export type DriverWithScores = DecisionDriver & {
  scoringOptions: ScoringScaleOption[];
};

type DriverContextValue = {
  // What drivers exist for the active project
  drivers: DriverWithScores[];

  // Helpful UI flags
  isLoading: boolean;
  error: string | null;
  hasDrivers: boolean;

  // Reload from DB
  refreshDrivers: () => Promise<void>;
};

const DriverContext = createContext<DriverContextValue | null>(null);

const fetchDrivers = async (projectId: string): Promise<DecisionDriver[]> => {
  const res = await window.api.drivers.listAllByProject({ projectId });
  return unwrapIpcResult(res);
};

const fetchScoreOptionsPerDriver = async (driverId: string) => {
  const res = unwrapIpcResult(
    await window.api.scoringScaleOption.listByDriver({ driverId })
  );
  return res;
};

export function DriverProvider({ children }: { children: ReactNode }) {
  const { activeProjectId } = useProjects();
  const [drivers, setDrivers] = useState<DriverWithScores[]>([]);
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

      // Fetch all score options concurrently
      const scoreOptionPromises = list.map(async (driver) => {
        const options: ScoringScaleOption[] = await fetchScoreOptionsPerDriver(driver.id);
        return {
          driverId: driver.id,
          options: options.map((opt) => ({
            id: opt.id,
            label: opt.label,
            value: opt.value,
            createdOn: opt.createdOn,
            updatedOn: opt.updatedOn,
            sortOrder: opt.sortOrder,
          }))
        };
      });

      // Wait for all promises to resolve
      const scoreOptionsResults = await Promise.all(scoreOptionPromises);
      
      // Create a map of driverId -> options for efficient lookup
      const scoreOptionsMap = new Map<string, ScoringScaleOption[]>();
      scoreOptionsResults.forEach(({ driverId, options }) => {
        scoreOptionsMap.set(driverId, options);
      });

      const listWithScores: DriverWithScores[] = list.map((driver) => {
        const options = scoreOptionsMap.get(driver.id) || [];
        return {
          ...driver,
          scoringOptions: options,
        };
      });
      console.log("listWithScores: ", listWithScores)

      setDrivers(listWithScores);
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