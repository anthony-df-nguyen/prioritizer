"use client";
import { useState } from "react";
import PageHeader from "../components/AppShell/PageHeader";
import Initalization from "../components/AppShell/Initialization";
import { CreateItemForm } from "./forms/CreateItemForm";
import { useItems } from "../context/ItemsContext";
import { useProjects, useDrivers } from "../context/DataContext";
import { ScaleIcon } from "@heroicons/react/24/outline";
import Table from "./table/Table";

const ItemsList = () => {
  const [createMode, handleCreateMode] = useState<boolean>(false);
  const { activeProjectId, hasProjects } = useProjects();
  const { hasDrivers } = useDrivers();
  const { refreshItems } = useItems();
  return (
    <div>
      <PageHeader
        title="Prioritize"
        actionButton={false}
        description="A folder groups together the items, decision drivers, and scoring rules for a specific initiative or problem space. It provides a focused context so prioritization is clear, consistent, and tailored to a single goal."
        icon={<ScaleIcon height={32} width={32} />}
      />
      {(!hasProjects || !hasDrivers) && <Initalization />}
      {hasProjects && hasDrivers && (
        <div>
          <div className="flex items-center gap-2 my-4">
            <button
              className="button bgPrimary bgHover"
              onClick={() => handleCreateMode(true)}
            >
              Add a Row
            </button>
            <button
              className="button bgPrimary bgHover"
              onClick={async () => {
                await window.api.items.updateAllItemScores({
                  projectId: activeProjectId as string,
                });
                refreshItems();
              }}
            >
              Refresh
            </button>
            <div className="flex-1"></div>
            <button className="button bgCancel bgHover">
              Add a Score Dimension
            </button>
          </div>
          {/* Create Form */}
          {createMode && (
            <CreateItemForm onCancel={() => handleCreateMode(false)} />
          )}
          {/* Existing Items */}
          {!createMode && <Table />}
        </div>
      )}
    </div>
  );
};

export default ItemsList;
