"use client";
import { useParams } from "next/navigation";
import { useProjects } from "@/app/context/ProjectContext";
import { EditProjectForm } from "@/app/folders/forms/EditForm";
import { useRouter } from "next/navigation";

export default function ProjectPage() {
  const { projectID } = useParams<{ projectID: string }>();
  const { projects } = useProjects();
  const router = useRouter();

  const project = projects.find((p) => p.id === projectID) ?? null;

  if (!project) return <div>Loading…</div>; // or refreshProjects()

  return (
    <div>
      <EditProjectForm
        project={project}
        onCancel={() => router.push("/folders")}
      />
    </div>
  );
}
