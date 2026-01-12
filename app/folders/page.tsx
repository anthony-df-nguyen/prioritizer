"use client";
import { useState } from "react";
import { useProjects, useDrivers } from "../context/DataContext";
import Initalization from "../components/AppShell/Initialization";
import { CreateProjectForm } from "./forms/CreateForm";
import { ImportButton, ExportButton, DeleteButton } from "../components/DBOps";
import PageHeader from "../components/AppShell/PageHeader";
import EmptyState from "../components/UI/EmptyState";
import Card from "../components/UI/Card";
import { useRouter } from "next/navigation";
import { FolderIcon } from "@heroicons/react/24/outline";

export default function Home() {
  const { projects, hasProjects, activeProjectId } = useProjects();
  const { hasDrivers } = useDrivers();
  const [createMode, handleCreateMode] = useState<boolean>(false);
  const router = useRouter();
  const goToProject = () =>
    router.push(`/folders/${activeProjectId}?edit=true`);

  const toggleCreate = () => {
    createMode ? handleCreateMode(false) : handleCreateMode(true);
  };

  const isDev = process.env.NEXT_PUBLIC_DEV_MODE === "true";

  return (
    <main className="space-y-6">
      <PageHeader
        title="Folders"
        actionButton={hasProjects ? true : false}
        actionText={"+ New Project"}
        onActionClick={toggleCreate}
        description="A folder groups together the items, decision drivers, and scoring rules for a specific initiative or problem space. It provides a focused context so prioritization is clear, consistent, and tailored to a single goal."
        icon={<FolderIcon height={32} width={32} />}
      />
      {/* Only Show DB Operation Buttons in Dev Mode */}
      {isDev && (
        <div className="flex items-center gap-2">
          <ImportButton />
          <ExportButton />
          <DeleteButton />
        </div>
      )}

      {/* Initialization */}
      {(!hasProjects || !hasDrivers) && (
        <Initalization driversRequired={false} />
      )}

      {/* Create Form for when projects do exist and user creates new ones */}
      {hasProjects && createMode && (
        <CreateProjectForm onCancel={toggleCreate} />
      )}

      {hasProjects && !createMode && (
        <div className="gap-4 grid lg:grid-cols-3">
          {" "}
          {projects.map((project) => (
            <Card
              key={project.id}
              onEditClick={goToProject}
              title={project.name}
              hypertext="Folder"
              selected={activeProjectId === project.id}
            >
              <div className="">
                <div>
                  <div className="text-neutral-600 text-xs">Project ID</div>
                  <div>{project.shortId || "Short ID"}</div>
                </div>
                <br />
                <div>
                  <div className="text-neutral-600 text-xs">Description</div>
                  <div>{project.description || "No description"}</div>
                </div>
                <div className="flex gap-4 justify-between mt-6">
                  <div>
                    {" "}
                    <div className="text-neutral-600 text-xs">Created On</div>
                    <div className="text-xs">
                      {new Date(project.createdOn).toLocaleString()}
                    </div>
                  </div>
                  <div>
                    {" "}
                    <div className="text-neutral-600 text-xs">Updated On</div>
                    <div className="text-xs">
                      {new Date(project.updatedOn).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
