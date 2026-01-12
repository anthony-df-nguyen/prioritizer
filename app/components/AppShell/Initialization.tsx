"use client";
import { useState } from "react";
import EmptyState from "../UI/EmptyState";
import {
  FolderIcon,
  ClipboardDocumentCheckIcon,
} from "@heroicons/react/24/outline";
import { useProjects, useDrivers } from "@/app/context/DataContext";
import { CreateProjectForm } from "@/app/folders/forms/CreateForm";
import { CreateCriteriaForm } from "@/app/decision-criteria/forms/CreateCriteria";

type Props = {
  driversRequired?: boolean
}

const Initalization = ({driversRequired = true}: Props) => {
  const { hasProjects } = useProjects();
  const { hasDrivers } = useDrivers();

  const [createForm, handleCreateForm] = useState<string | null>(null);


  return (
    <div className="my-8">
      {/* 1st a project must exist */}
      {!hasProjects && !createForm && (
        <EmptyState
          text="Create a Folder"
          icon={<FolderIcon />}
          description="A folder is required to begin prioritizing anything"
          primaryOnclick={() => handleCreateForm("project")}
        />
      )}
      {/* If projects exist but drivers don't, they need to make a driver */}
      {hasProjects && driversRequired && !hasDrivers && !createForm && (
        <EmptyState
          text="Create Scoring Dimension"
          description="One more step before you begin prioritizing.
        Create at least one Scoring Dimension — this defines how your items will be evaluated and scored."
          primaryOnclick={() => handleCreateForm("driver")}
          icon={<ClipboardDocumentCheckIcon />}
        />
      )}
      {/* Render Create Forms */}
      {createForm === "project" && (
        <CreateProjectForm onCancel={() => handleCreateForm(null)} />
      )}
      {createForm === "driver" && (
        <CreateCriteriaForm onCancel={() => handleCreateForm(null)} />
      )}
    </div>
  );
};

export default Initalization;
