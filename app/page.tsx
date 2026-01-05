"use client";
import { useState } from "react";
import { useProjects, useDrivers } from "./context/DataContext";
import EmptyState from "./components/UI/EmptyState";
import { CreateProjectForm } from "./folders/forms/CreateForm";
import { CreateCriteriaForm } from "./decision-criteria/forms/CreateCriteria";
import {
  FolderIcon,
  ClipboardDocumentCheckIcon,
} from "@heroicons/react/24/outline";
import ItemsPage from "./items/page";

export default function Home() {
  const { hasProjects, refreshProjects, activeProject } = useProjects();
  const { hasDrivers } = useDrivers();
  const [createMode, handleCreateMode] = useState<boolean>(false);
  const [driverCreateMode, handleDriverCreate] = useState<boolean>(false);

  const toggleCreate = () => {
    createMode ? handleCreateMode(false) : handleCreateMode(true);
  };

  return (
    <main className="space-y-6">
      {hasProjects && activeProject && (
        <div>
          <div className="flex flex-row  items-center gap-2 ">
            <div className="h-8 w-8">{<FolderIcon />}</div>
            <div className="text-2xl font-semibold">{activeProject.name}</div>
          </div>

          <div className="font-base mt-1">{activeProject.description}</div>
        </div>
      )}
      {/* If there are no projects */}
      {!hasProjects && (
        <div className="text-2xl font-semibold">No Projects Created</div>
      )}
      {!hasProjects && !createMode && (
        <EmptyState
          text="Create a project"
          icon={<FolderIcon />}
          description="A project is required to begin building items and scoring criteria"
          primaryOnclick={toggleCreate}
        />
      )}
      {createMode && (
        <div className="">
          <CreateProjectForm
            // onCreate={async (payload) => {
            //   await window.api.projects.create(payload);
            //   refreshProjects();
            // }}
            onCancel={() => handleCreateMode(false)}
          />
        </div>
      )}

      {/* If a user has projects but no drivers */}
      {hasProjects && !hasDrivers && !driverCreateMode && (
        <EmptyState
          text="Create Scoring Criteria"
          description="One more step before you begin prioritizing.
Create at least one Scoring Criteria — this defines how your items will be evaluated and scored."
          primaryOnclick={() => handleDriverCreate(true)}
          icon={<ClipboardDocumentCheckIcon />}
        />
      )}
      {driverCreateMode && (
        <CreateCriteriaForm onCancel={() => handleDriverCreate(false)} />
      )}

      {/* If user finally has projects, drivers, and  items */}
      {!createMode && hasProjects && hasDrivers && <ItemsPage />}
    </main>
  );
}
