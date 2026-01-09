"use client";
import { useState } from "react";
import PageHeader from "../components/AppShell/PageHeader";
import { useDrivers, useProjects } from "../context/DataContext";
import { useRouter } from "next/navigation";
import { CreateCriteriaForm } from "./forms/CreateCriteria";
import Card from "../components/UI/Card";
import EmptyState from "../components/UI/EmptyState";
import {
  FolderIcon,
  ClipboardDocumentCheckIcon,
} from "@heroicons/react/24/outline";
import { CreateProjectForm } from "../folders/forms/CreateForm";

export default function DecisionCriteria() {
  const { drivers, hasDrivers } = useDrivers();
  const { hasProjects } = useProjects();
  const [createMode, handleCreateMode] = useState<boolean>(false);
  const [createProject, handleCreateProject] = useState<boolean>(false);

  const toggleCreate = () => {
    createMode ? handleCreateMode(false) : handleCreateMode(true);
  };

  const router = useRouter();

  return (
    <main className="space-y-6">
      <PageHeader
        title="Decision Criteria"
        actionButton={hasProjects ? true : false}
        actionText="+ New Criteria"
        description="Decision Criteria are the factors used to evaluate and compare items within a project. Each criterion represents what matters most (such as impact, effort, or risk) and is typically weighted to reflect its relative importance in the final priority score."
        onActionClick={toggleCreate}
        icon={<ClipboardDocumentCheckIcon height={32} width={32} />}
      />
      {/* Empty State when No Projects Have been Made Yet*/}
      {!hasProjects && !createProject && (
        <EmptyState
          text="Create a Folder"
          icon={<FolderIcon />}
          description="A folder is required to begin prioritizing anything"
          primaryOnclick={() => handleCreateProject(true)}
        />
      )}
      {/* Empty State when a project is made but no drivers yet*/}
      {hasProjects && !hasDrivers && (
        <EmptyState
          text="Create Scoring Dimension"
          description="One more step before you begin prioritizing.
        Create at least one Scoring Dimension — this defines how your items will be evaluated and scored."
          primaryOnclick={() => handleCreateMode(true)}
          icon={<ClipboardDocumentCheckIcon />}
        />
      )}
      {createProject && (
        <CreateProjectForm onCancel={() => handleCreateProject(false)} />
      )}
      {createMode && (
        <CreateCriteriaForm onCancel={() => handleCreateMode(false)} />
      )}
      {/* Drivers */}
      {!createMode && (
        <div className="gap-4 grid lg:grid-cols-2">
          {drivers.map((d) => (
            <Card
              key={d.id}
              title={d.name}
              hypertext="Criteria"
              onEditClick={() => router.push(`/decision-criteria/${d.id}`)}
              selected={false}
              active={d.archived === 0 ? true : false}
            >
              <div>
                {/* Descriptions */}
                <div>
                  <div className="text-neutral-600 text-xs">Description</div>
                  <div>{d.description || ""}</div>
                </div>
                {/* Weight */}
                <br />
                <div>
                  <div className="text-neutral-600 text-xs">Weight</div>
                  <div>{d.weight}</div>
                </div>
                {/* Timestamps */}
                <div className="flex gap-4 justify-between mt-6">
                  <div>
                    {" "}
                    <div className="text-neutral-600 text-xs">Created On</div>
                    <div className="text-xs">
                      {new Date(d.createdOn).toLocaleString()}
                    </div>
                  </div>
                  <div>
                    {" "}
                    <div className="text-neutral-600 text-xs">Updated On</div>
                    <div className="text-xs">
                      {new Date(d.updatedOn).toLocaleString()}
                    </div>
                  </div>
                </div>
                {/* Scores */}
                <div className="mt-4 flex-col flex gap-2">
                  {d.scoringOptions.map((o) => (
                    <div
                      key={o.id}
                      className="flex items-center justify-between  font-mono text-sm bg-gray-100 rounded-lg p-2"
                    >
                      <div>{o.label}</div>
                      <div>{o.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
