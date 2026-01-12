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
import type { ScoringScaleWithOptions } from "@/electron/db/schema";

// Minimal ScoringScale shape (matches your drizzle schema fields used by the UI)
type ScoringScale = OutputOf<"scoringScales:listByProject">[number];



type ScoringScaleContextValue = {
  // What scoring scales exist for the active project
  scoringScales: ScoringScaleWithOptions[];

  // Helpful UI flags
  isLoading: boolean;
  error: string | null;
  hasScoringScales: boolean;

  // Reload from DB
  refreshScoringScales: () => Promise<void>;
};

const ScoringScaleContext = createContext<ScoringScaleContextValue | null>(
  null
);

const fetchScoringScales = async (
  projectId: string
): Promise<ScoringScaleWithOptions[]> => {
  const res = await window.api.scoringScales.listByProject({ projectId });
  const scales = unwrapIpcResult(res);
  
  // Fetch options for each scale
  const scaleWithOptionsPromises = scales.map(async (scale: ScoringScale) => {
    const optionsRes = unwrapIpcResult(await window.api.scoringScaleOption.listByScale({
      scaleId: scale.id,
    }))
    return {
      ...scale,
      options: optionsRes,
    };
  });
  
  return Promise.all(scaleWithOptionsPromises);
};

export function ScoringScaleProvider({ children }: { children: ReactNode }) {
  const { activeProjectId } = useProjects();
  const [scoringScales, setScoringScales] = useState<ScoringScaleWithOptions[]>([]);
  //console.log('scoringScales: ', scoringScales);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refreshScoringScales = useCallback(async () => {
    if (!activeProjectId) {
      setScoringScales([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const list = await fetchScoringScales(activeProjectId);
      setScoringScales(list);
    } catch (e) {
      setScoringScales([]);
      setError("Failed to load scoring scales");
    } finally {
      setIsLoading(false);
    }
  }, [activeProjectId]);

  // Initial load and when active project changes
  useEffect(() => {
    void refreshScoringScales();
  }, [activeProjectId, refreshScoringScales]);

  const value = useMemo<ScoringScaleContextValue>(
    () => ({
      scoringScales,
      isLoading,
      error,
      hasScoringScales: scoringScales.length > 0,
      refreshScoringScales,
    }),
    [scoringScales, isLoading, error, refreshScoringScales]
  );

  return (
    <ScoringScaleContext.Provider value={value}>
      {children}
    </ScoringScaleContext.Provider>
  );
}

export function useScoringScales() {
  const ctx = useContext(ScoringScaleContext);
  if (!ctx) {
    throw new Error(
      "useScoringScales must be used within a <ScoringScaleProvider>"
    );
  }
  return ctx;
}