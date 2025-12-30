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

// Minimal Project shape (matches your drizzle schema fields used by the UI)
type Project = OutputOf<"projects:list">[number];

type ProjectContextValue = {
  // What projects exist
  projects: Project[];

  // Active project selection
  activeProjectId: string | null;
  activeProject: Project | null;
  setActiveProjectId: (projectId: string | null) => void;

  // Helpful UI flags
  isLoading: boolean;
  error: string | null;
  hasProjects: boolean;

  // Reload from DB
  refreshProjects: () => Promise<void>;
};

const ProjectContext = createContext<ProjectContextValue | null>(null);

const ACTIVE_PROJECT_STORAGE_KEY = "prioritizer.activeProjectId";

function safeReadStoredActiveProjectId(): string | null {
  try {
    return window.localStorage.getItem(ACTIVE_PROJECT_STORAGE_KEY);
  } catch {
    return null;
  }
}

function safeWriteStoredActiveProjectId(value: string | null) {
  try {
    if (!value) {
      window.localStorage.removeItem(ACTIVE_PROJECT_STORAGE_KEY);
      return;
    }
    window.localStorage.setItem(ACTIVE_PROJECT_STORAGE_KEY, value);
  } catch {
    // ignore
  }
}

const fetchProjects = async (): Promise<Project[]> => {
  const res = await window.api.projects.list();
  return unwrapIpcResult(res);
};

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, _setActiveProjectId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refreshProjects = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const list = await fetchProjects();
      setProjects(list);

      // Keep the active project valid.
      const stored = safeReadStoredActiveProjectId();
      const storedIsValid = !!stored && list.some((p) => p.id === stored);

      if (storedIsValid) {
        _setActiveProjectId(stored);
      } else if (list.length > 0) {
        _setActiveProjectId(list[0].id);
        safeWriteStoredActiveProjectId(list[0].id);
      } else {
        _setActiveProjectId(null);
        safeWriteStoredActiveProjectId(null);
      }
    } catch (e) {
      setProjects([]);
      _setActiveProjectId(null);
      safeWriteStoredActiveProjectId(null);
      setError("Failed to load projects");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    // Initialize from storage immediately (so the UI doesn't flicker)
    const stored = safeReadStoredActiveProjectId();
    if (stored) _setActiveProjectId(stored);

    void refreshProjects();
  }, [refreshProjects]);

  const setActiveProjectId = useCallback((projectId: string | null) => {
    _setActiveProjectId(projectId);
    safeWriteStoredActiveProjectId(projectId);
  }, []);

  const activeProject = useMemo(() => {
    if (!activeProjectId) return null;
    return projects.find((p) => p.id === activeProjectId) ?? null;
  }, [projects, activeProjectId]);

  const value = useMemo<ProjectContextValue>(
    () => ({
      projects,
      activeProjectId,
      activeProject,
      setActiveProjectId,
      isLoading,
      error,
      hasProjects: projects.length > 0,
      refreshProjects,
    }),
    [
      projects,
      activeProjectId,
      activeProject,
      setActiveProjectId,
      isLoading,
      error,
      refreshProjects,
    ]
  );

  return (
    <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
  );
}

export function useProjects() {
  const ctx = useContext(ProjectContext);
  if (!ctx) {
    throw new Error("useProjects must be used within a <ProjectProvider>");
  }
  return ctx;
}
