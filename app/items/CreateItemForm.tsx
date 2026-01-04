import React, { useEffect, useMemo, useState } from "react";
import type { NewItem } from "@/electron/db/schema/items";
import { useProjects } from "@/app/context/ProjectContext";

type CreateItemFormProps = {
  /** Call your IPC / API here. Return the created item or void. */
  onCreate: (payload: NewItem) => Promise<void> | void;
  onCancel: () => void;
};

function nowIso() {
  return new Date().toISOString();
}

export function CreateItemForm({
  onCreate,
  onCancel,
}: CreateItemFormProps) {
  const { activeProjectId } = useProjects();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const errors = useMemo(() => {
    const e: Record<string, string> = {};

    if (!name.trim()) e.name = "Item name is required.";

    if (description.length > 500)
      e.description = "Description is too long (max 500 chars).";

    return e;
  }, [name, description]);

  const canSubmit = Object.keys(errors).length === 0 && !submitting;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (!canSubmit) return;

    try {
      setSubmitting(true);

      const timestamp = nowIso();

      const payload: NewItem = {
        id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}`, // fallback
        projectId: activeProjectId as string,
        name: name.trim(),
        description: description.trim() ? description.trim() : null,
        createdOn: timestamp,
        updatedOn: timestamp,
        archived: 0,
        archivedOn: null,
      };

      await onCreate(payload);
    } catch (err) {
      setFormError("Failed to create item.");
    } finally {
      setSubmitting(false);
      onCancel();
    }
  }

  return (
    <div className="bg-white relative block w-full rounded-lg border-1 border-gray-300 p-12 hover:border-gray-400 focus:outline-2 focus:outline-offset-2 focus:outline-indigo-600 cursor-pointer">
      <form onSubmit={handleSubmit} className="max-w-xl block mx-auto space-y-6">
        <div>
          <h2 className="text-lg font-semibold">Create item</h2>
          <p className="text-sm text-neutral-500">
            Items are the things you are making decisions about.
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
            placeholder="e.g., New product feature"
            className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-900"
          />
          {errors.name && <p className="error_text">{errors.name}</p>}
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional context for this item…"
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
            {submitting ? "Creating…" : "Create item"}
          </button>
        </div>
      </form>
    </div>
  );
}