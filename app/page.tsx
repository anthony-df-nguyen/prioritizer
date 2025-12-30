"use client";
import { useState, useEffect } from "react";
import { useProjects } from "./context/ProjectContext";
import EmptyState from "./components/UI/EmptyState";
import { CreateProjectForm } from "./projects/CreateForm";
import Card from "./components/UI/Card";
import { FolderIcon } from "@heroicons/react/24/outline";
import { type Project } from "@/electron/db/schema";

export default function Home() {
  const { projects, hasProjects, refreshProjects, activeProject } =
    useProjects();
  const [createMode, handleCreateMode] = useState<boolean>(false);

  const toggleCreate = () => {
    createMode ? handleCreateMode(false) : handleCreateMode(true);
  };

  return (
    <main className="space-y-6">
      {hasProjects && activeProject && (
        <div>
          <div>Project</div>
          <div className="text-2xl font-semibold">{activeProject.name}</div>
          <div className="text-2l font-base">{activeProject.description}</div>
        </div>
      )}
      {!hasProjects && <div className="text-2xl font-semibold">No Projects Created</div>}
      {!hasProjects && !createMode && (
        <EmptyState
          text="Create a project"
          icon={<FolderIcon />}
          description="A project is required to begin building items and decision criteria"
          primaryOnclick={toggleCreate}
        />
      )}
      {createMode && (
        <div className="">
          <CreateProjectForm
            onCreate={async (payload) => {
              await window.api.projects.create(payload);
              refreshProjects();
            }}
            onCancel={() => handleCreateMode(false)}
          />
        </div>
      )}
    </main>
  );
}
