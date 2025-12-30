import React, { useEffect, useMemo, useState } from "react";
import type { NewProject } from "@/electron/db/schema/projects";

type CreateProjectFormProps = {
  /** Call your IPC / API here. Return the created project or void. */
  onCreate: (payload: NewProject) => Promise<void> | void;
  onCancel: () => void;
  /** Optional: if you want to validate uniqueness client-side */
  existingShortIds?: string[];

};

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

export function CreateProjectForm({
  onCreate,
  onCancel,
  existingShortIds = [],
}: CreateProjectFormProps) {
  const existingSet = useMemo(
    () => new Set(existingShortIds.map((s) => s.toLowerCase())),
    [existingShortIds]
  );

  const [name, setName] = useState("");
  const [shortId, setShortId] = useState("");
  const [description, setDescription] = useState("");

  const [shortIdTouched, setShortIdTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

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
      if (existingSet.has(normalized)) {
        e.shortId = "That Short ID already exists.";
      }
    }

    if (description.length > 500)
      e.description = "Description is too long (max 500 chars).";

    return e;
  }, [name, shortId, description, existingSet]);

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

      await onCreate(payload);
    } catch (err) {
      setFormError("Failed to create project.");
    } finally {
      setSubmitting(false);
      onCancel();
    }
  }

  return (
    <div className="bg-white relative block w-full rounded-lg border-1 border-gray-300 p-12  hover:border-gray-400 focus:outline-2 focus:outline-offset-2 focus:outline-indigo-600 cursor-pointer">
      {" "}
      <form onSubmit={handleSubmit} className="max-w-xl block mx-auto space-y-6">
        <div>
          <h2 className="text-lg font-semibold">Create project</h2>
          <p className="text-sm text-neutral-500">
            Projects need a name and a unique Short ID (used in URLs /
            references).
          </p>
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
              setShortIdTouched(true);
              setShortId(e.target.value);
            }}
            onBlur={() => setShortIdTouched(true)}
            placeholder="e.g., q1-growth"
            className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-900"
          />
          <div className="text-xs text-neutral-500">
            Lowercase letters/numbers + hyphens only. This should be stable over
            time.
          </div>
          {errors.shortId && (
            <p className="error_text">{errors.shortId}</p>
          )}
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
          <button className="cancel_button" onClick={onCancel}>
            Cancel
          </button>
          <button
            type="submit"
            disabled={!canSubmit}
            className="submit_button"
          >
            {submitting ? "Creating…" : "Create project"}
          </button>
        </div>
      </form>
    </div>
  );
}
