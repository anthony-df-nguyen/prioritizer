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
import { useProjects } from "./ProjectContext";
import { type Item, type ItemDriverScore } from "@/electron/db/schema";

type ItemsContextValue = {
  // What items exist for the active project
  items: Item[];

  // Helpful UI flags
  isLoading: boolean;
  error: string | null;
  hasItems: boolean;

  // Reload from DB
  refreshItems: () => Promise<void>;
};

export type ItemsWithScores = Item & {
  [driverId: string]: number | null;
};

const ItemsContext = createContext<ItemsContextValue | null>(null);

const fetchItems = async (projectId: string): Promise<ItemsWithScores[]> => {
  const res = await window.api.items.listByProject({ projectId });
  return unwrapIpcResult(res);
};

export function ItemsProvider({ children }: { children: ReactNode }) {
  const { activeProjectId } = useProjects();
  const [items, setItems] = useState<ItemsWithScores[]>([]);
  console.log('items: ', items);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refreshItems = useCallback(async () => {
    if (!activeProjectId) {
      setItems([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const list = await fetchItems(activeProjectId);

      // Fetch scores for each item
      const itemsWithScores = await Promise.all(
        list.map(async (item) => {
          const newData: ItemsWithScores = { ...item };

          try {
            const scores = await window.api.itemScores.listByItem({
              itemId: item.id,
            });

            const scoreArray = unwrapIpcResult(scores);

            scoreArray.forEach((s: ItemDriverScore) => {
              newData[s.driverId] = s.value;
            });
          } catch (e) {
            console.error("Failed to load scores for item", item.id, e);
          }

          return newData;
        })
      );

      setItems(itemsWithScores);
    } catch (e) {
      setItems([]);
      setError("Failed to load items");
    } finally {
      setIsLoading(false);
    }
  }, [activeProjectId]);

  // Initial load and when active project changes
  useEffect(() => {
      refreshItems();
  }, [activeProjectId, refreshItems]);

  const value = useMemo<ItemsContextValue>(
    () => ({
      items,
      isLoading,
      error,
      hasItems: items.length > 0,
      refreshItems,
    }),
    [items, isLoading, error, refreshItems]
  );

  return (
    <ItemsContext.Provider value={value}>{children}</ItemsContext.Provider>
  );
}

export function useItems() {
  const ctx = useContext(ItemsContext);
  if (!ctx) {
    throw new Error("useItems must be used within a <ItemsProvider>");
  }
  return ctx;
}
