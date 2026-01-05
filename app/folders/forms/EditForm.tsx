"use client";

import type { Project } from "@/electron/db/schema/projects";
import { EditProjectFormLogic } from "./logic";
import { Text, TextArea } from "@/app/components/UI/Inputs";

type EditProjectFormProps = {
  project: Project;
  onCancel: () => void;
};

export function EditProjectForm({ project, onCancel }: EditProjectFormProps) {
  const {
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
  } = EditProjectFormLogic({ project, onCancel });

  return (
    <div className="relative block w-full rounded-lg border border-neutral-200 bg-white p-6">
      <form onSubmit={handleSubmit} className="max-w-xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Edit Folder</h2>
        </div>

        {formError && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {formError}
          </div>
        )}

        {/* Name */}
        <div className="space-y-1.5">
          <Text
            label="Name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Q1 Growth Initiatives"
            error={!!errors.name}
            errorText={errors.name}
          />
        </div>

        {/* Short ID */}
        <div className="space-y-1.5">
          <Text
            label="Short ID"
            required
            value={shortId}
            onChange={(e) => {
              setShortId(e.target.value);
            }}
            placeholder="e.g., q1-growth"
            error={!!errors.shortId}
            errorText={errors.shortId}
            helpText=" Lowercase letters/numbers + hyphens only. This should be stable over
            time."
          />
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <TextArea
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional context for this project…"
            error={!!errors.description}
            errorText={errors.description}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <button type="button" className="cancel_button" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" disabled={!canSubmit} className="submit_button">
            {submitting ? "Updating…" : "Update Folder"}
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
