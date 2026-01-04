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
import { DecisionDriver } from "@/electron/db/schema";
import { useProjects } from "./ProjectContext";
import { useScoringScales } from "./ScoringScaleContext";

// Minimal Driver shape (matches your drizzle schema fields used by the UI)
export type DriverWithScores = DecisionDriver & {
  scoringScaleOptions: {
    id: string;
    label: string;
    value: number | null;
  }[];
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

export function DriverProvider({ children }: { children: ReactNode }) {
  const { activeProjectId } = useProjects();
  const [drivers, setDrivers] = useState<DriverWithScores[]>([]);
  const { scoringScales } = useScoringScales();
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

      // Create a map of scaleId -> options for efficient lookup
      const scaleOptionsMap = new Map<
        string,
        { id: string; label: string; value: number | null }[]
      >();
      scoringScales.forEach((scale) => {
        if (scale.options) {
          scaleOptionsMap.set(
            scale.id,
            scale.options.map((option) => ({
              id: option.id,
              label: option.label,
              value: option.value,
            }))
          );
        }
      });

      const listWithScores: DriverWithScores[] = list.map((driver) => {
        const options = scaleOptionsMap.get(driver.scaleId) || [];
        return {
          ...driver,
          scoringScaleOptions: options,
        };
      });

      setDrivers(listWithScores);
    } catch (e) {
      setDrivers([]);
      setError("Failed to load drivers");
    } finally {
      setIsLoading(false);
    }
  }, [activeProjectId, scoringScales]);

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
