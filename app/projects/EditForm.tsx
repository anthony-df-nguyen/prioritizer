"use client";

import React, { useEffect, useMemo, useState } from "react";
import type { Project } from "@/electron/db/schema/projects";
import { InputOf } from "@/shared/ipc/types";
import { useProjects } from "@/app/context/ProjectContext";
import { unwrapIpcResult } from "@/shared/ipc/unwrap";
import { addIssueToContext } from "zod/v3";

type EditProjectFormProps = {
  project: Project;
  onCancel: () => void;
};

export function EditProjectForm({ project, onCancel }: EditProjectFormProps) {
  const [name, setName] = useState(project.name);
  const [shortId, setShortId] = useState(project.shortId);
  const [description, setDescription] = useState(project.description ?? "");

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const { refreshProjects } = useProjects();

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

      const payload: InputOf<"projects:update"> = {
        id: project.id,
        name: name.trim(),
        shortId: shortId.trim().toLowerCase(),
        description: description.trim() ? description.trim() : null,
      };
      const res = await window.api.projects.update(payload);
      const updated = unwrapIpcResult<Project>(res);
      console.log("updated: ", updated);

      // Only close + refresh on success
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

  return (
    <div className="relative block w-full rounded-lg border border-neutral-200 bg-white p-6">
      <form onSubmit={handleSubmit} className="max-w-xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Edit Project</h2>
        </div>

        {formError && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {formError}
          </div>
        )}

        {/* Name */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Q1 Growth Initiatives"
            className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-900"
          />
          {errors.name && <p className="error_text">{errors.name}</p>}
        </div>

        {/* Short ID */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium">
            Short ID <span className="text-red-500">*</span>
          </label>
          <input
            value={shortId}
            onChange={(e) => {
              setShortId(e.target.value);
            }}
            placeholder="e.g., q1-growth"
            className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-900"
          />
          <div className="text-xs text-neutral-500">
            Lowercase letters/numbers + hyphens only. This should be stable over
            time.
          </div>
          {errors.shortId && <p className="error_text">{errors.shortId}</p>}
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional context for this project…"
            rows={4}
            className="w-full resize-none rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-900"
          />
          <div className="text-xs text-neutral-500">
            {description.length}/500
          </div>
          {errors.description && (
            <p className="error_text">{errors.description}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <button type="button" className="cancel_button" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" disabled={!canSubmit} className="submit_button">
            {submitting ? "Updating…" : "Update project"}
          </button>
        </div>

        {!isDirty && (
          <p className="text-xs text-neutral-500 text-right">
            No changes to save.
          </p>
        )}
      </form>
    </div>
  );
}
