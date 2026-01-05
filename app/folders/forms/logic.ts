import React, { useEffect, useMemo, useState } from "react";
import { useProjects } from "@/app/context/DataContext";
import type { NewProject } from "@/electron/db/schema/projects";
import type { Project } from "@/electron/db/schema/projects";

function slugifyShortId(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 32); // keep it short-ish; adjust to taste
}

function nowIso() {
  return new Date().toISOString();
}

type CreateProjectFormLogicProps = {
  onCancel: () => void;
};

export function CreateProjectFormLogic({
  onCancel,
}: CreateProjectFormLogicProps) {
  const [name, setName] = useState("");
  const [shortId, setShortId] = useState("");
  const [description, setDescription] = useState("");
  const [shortIdTouched, setShortIdTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const { refreshProjects } = useProjects();

  // Auto-suggest shortId from name until the user edits shortId manually.
  useEffect(() => {
    if (shortIdTouched) return;
    setShortId(slugifyShortId(name));
  }, [name, shortIdTouched]);

  const errors = useMemo(() => {
    const e: Record<string, string> = {};

    if (!name.trim()) e.name = "Project name is required.";

    if (!shortId.trim()) {
      e.shortId = "Short ID is required.";
    } else {
      const normalized = shortId.trim().toLowerCase();
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(normalized)) {
        e.shortId =
          "Use lowercase letters/numbers with hyphens (e.g., team-roadmap).";
      }
    }

    if (description.length > 500)
      e.description = "Description is too long (max 500 chars).";

    return e;
  }, [name, shortId, description]);

  const canSubmit = Object.keys(errors).length === 0 && !submitting;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (!canSubmit) return;

    try {
      setSubmitting(true);

      const timestamp = nowIso();

      const payload: NewProject = {
        id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}`, // fallback
        name: name.trim(),
        shortId: shortId.trim().toLowerCase(),
        description: description.trim() ? description.trim() : null,
        createdOn: timestamp,
        updatedOn: timestamp,
        archived: 0,
        archivedOn: null,
      };

      await window.api.projects.create(payload);
      refreshProjects();
    } catch (err) {
      setFormError("Failed to create project.");
    } finally {
      setSubmitting(false);
      onCancel();
    }
  }

  return {
    name,
    setName,
    shortId,
    setShortId,
    description,
    setDescription,
    shortIdTouched,
    setShortIdTouched,
    submitting,
    setSubmitting,
    formError,
    setFormError,
    errors,
    canSubmit,
    handleSubmit,
  };
}

type EditProjectFormLogicProps = {
  project: Project;
  onCancel: () => void;
};

export function EditProjectFormLogic({
  project,
  onCancel,
}: EditProjectFormLogicProps) {
  const [name, setName] = useState(project.name);
  const [shortId, setShortId] = useState(project.shortId);
  const [description, setDescription] = useState(project.description ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const {refreshProjects} = useProjects();

  // If the parent swaps the project prop (e.g., user clicks a different project), reset form state.
  useEffect(() => {
    setName(project.name);
    setShortId(project.shortId);
    setDescription(project.description ?? "");
    setFormError(null);
    setSubmitting(false);
  }, [project.id]);

  const errors = useMemo(() => {
    const e: Record<string, string> = {};

    if (!name.trim()) e.name = "Project name is required.";

    if (!shortId.trim()) {
      e.shortId = "Short ID is required.";
    } else {
      const normalized = shortId.trim().toLowerCase();
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(normalized)) {
        e.shortId =
          "Use lowercase letters/numbers with hyphens (e.g., team-roadmap).";
      }
    }

    if (description.length > 500) {
      e.description = "Description is too long (max 500 chars).";
    }

    return e;
  }, [name, shortId, description]);

  // Only enable submit if:
  // - no validation errors
  // - not submitting
  // - at least one field changed
  const isDirty = useMemo(() => {
    const nextName = name.trim();
    const nextShortId = shortId.trim().toLowerCase();
    const nextDesc = description.trim() ? description.trim() : null;

    const prevName = project.name;
    const prevShortId = project.shortId;
    const prevDesc = project.description ?? null;

    return (
      nextName !== prevName ||
      nextShortId !== prevShortId ||
      nextDesc !== prevDesc
    );
  }, [
    name,
    shortId,
    description,
    project.name,
    project.shortId,
    project.description,
  ]);

  const canSubmit = Object.keys(errors).length === 0 && !submitting && isDirty;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (!canSubmit) return;

    try {
      setSubmitting(true);

      const payload = {
        id: project.id,
        name: name.trim(),
        shortId: shortId.trim().toLowerCase(),
        description: description.trim() ? description.trim() : null,
      };

      await window.api.projects.update(payload);
      await refreshProjects();
      onCancel();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to update project.";
      setFormError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return {
    name,
    setName,
    shortId,
    setShortId,
    description,
    setDescription,
    submitting,
    setSubmitting,
    formError,
    setFormError,
    errors,
    isDirty,
    canSubmit,
    handleSubmit,
  };
}
