"use client";
import { useState } from "react";
import { useProjects } from "../context/DataContext";
import { CreateProjectForm } from "./forms/CreateForm";
import ExportButton from "../components/ExportButton";
import ImportButton from "../components/ImportButton";
import PageHeader from "../components/AppShell/PageHeader";
import Card from "../components/UI/Card";
import { useRouter } from "next/navigation";
import { FolderIcon } from "@heroicons/react/24/outline";

export default function Home() {
  const { projects, hasProjects, activeProjectId } = useProjects();
  const [createMode, handleCreateMode] = useState<boolean>(false);
  const router = useRouter();
  const goToProject = () =>
    router.push(`/folders/${activeProjectId}?edit=true`);

  const toggleCreate = () => {
    createMode ? handleCreateMode(false) : handleCreateMode(true);
  };

  return (
    <main className="space-y-6">
      <PageHeader
        title="Folders"
        actionButton={true}
        actionText="+ New Project"
        onActionClick={toggleCreate}
        description="A folder groups together the items, decision drivers, and scoring rules for a specific initiative or problem space. It provides a focused context so prioritization is clear, consistent, and tailored to a single goal."
        icon={<FolderIcon height={32} width={32} />}
      />
      <div className="flex items-center gap-2">
        <ImportButton />
        <ExportButton />
      </div>

      {createMode && (
        <div className="">
          <CreateProjectForm onCancel={() => handleCreateMode(false)} />
        </div>
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
