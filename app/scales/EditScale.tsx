import React, { useMemo, useState } from "react";
import type {
  ScoringScaleOption,
  ScoringScaleWithOptions,
} from "@/electron/db/schema/scoringScales";
import { useProjects } from "@/app/context/ProjectContext";
import { useScoringScales } from "@/app/context/ScoringScaleContext";
import { useItems } from "../context/ItemsContext";

type EditScaleFormProps = {
  scale: ScoringScaleWithOptions;
  onCancel: () => void;
  /** Optional: if you want to validate uniqueness client-side */
  existingNames?: string[];
};

function nowIso() {
  return new Date().toISOString();
}

export function EditScaleForm({
  scale,
  onCancel,
  existingNames = [],
}: EditScaleFormProps) {
  const { activeProjectId } = useProjects();
  const { refreshScoringScales } = useScoringScales();
  const {refreshItems} = useItems();
  const existingSet = useMemo(
    () => new Set(existingNames.map((s) => s.toLowerCase())),
    [existingNames]
  );

  const [name, setName] = useState(scale.name);
  const [description, setDescription] = useState(scale.description || "");
  const [options, setOptions] = useState<ScoringScaleOption[]>(
    scale.options || []
  );
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const errors = useMemo(() => {
    const e: Record<string, string> = {};

    if (!name.trim()) e.name = "Scale name is required.";

    if (existingSet.has(name.trim().toLowerCase())) {
      e.name = "A scale with this name already exists in this project.";
    }

    // Validate options
    options.forEach((option, index) => {
      if (!option.label.trim()) {
        e[`option-label-${index}`] = "Option label is required.";
      }
      if (option.value === undefined || option.value === null) {
        e[`option-value-${index}`] = "Option value is required.";
      }
    });

    return e;
  }, [name, options, existingSet]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    try {
      setSubmitting(true);

      const timestamp = nowIso();

      // Update the scale
      const scalePayload = {
        id: scale.id,
        projectId: activeProjectId as string,
        name: name.trim(),
        description: description?.trim() || null,
        updatedOn: timestamp,
        archived: scale.archived,
        archivedOn: scale.archivedOn,
      };

      // Update the scale
      await window.api.scoringScales.update(scalePayload);

      // Update options
      const updatedOptions = options.map((option, index) => ({
        ...option,
        label: option.label.trim(),
        value: option.value,
        sortOrder: index,
        updatedOn: timestamp,
      }));

      // Separate existing options (with database IDs) from new options (without IDs)
      const existingOptions = updatedOptions.filter(
        (option) => option.id && !option.id.startsWith("temp-")
      );
      const newOptions = updatedOptions.filter(
        (option) => !option.id || option.id.startsWith("temp-")
      );

      // Delete existing options that are no longer in the form
      const existingOptionIds = new Set(existingOptions.map((o) => o.id));
      const optionsToDelete = scale.options.filter(
        (option) => !existingOptionIds.has(option.id)
      );

      // Delete removed options
      for (const option of optionsToDelete) {
        await window.api.scoringScaleOption.delete({
          id: option.id,
          projectId: activeProjectId,
        });
         refreshItems();
      }
      // Update existing options
      for (const option of existingOptions) {
        // Find the original option to compare values
        await window.api.scoringScaleOption.update({
          ...option, 
          projectId: activeProjectId,
        });
        refreshItems();
      }

      // Create new options
      for (const option of newOptions) {
        await window.api.scoringScaleOption.create({
          ...option,
          scaleId: scale.id,
          createdOn: timestamp,
          updatedOn: timestamp,
          projectId: activeProjectId as string,
        });
      }
    } catch (err) {
      setFormError("Failed to update scoring scale.");
      console.error("Error updating scale:", err);
    } finally {
      refreshScoringScales();
      setSubmitting(false);
      onCancel();
    }
  }
  function addOption() {
    setOptions([
      ...options,
      {
        id: `temp-${Date.now()}`,
        label: "",
        value:
          options.length > 0 ? Math.max(...options.map((o) => o.value)) + 1 : 1,
        scaleId: scale.id,
        sortOrder: options.length,
        createdOn: nowIso(),
        updatedOn: nowIso(),
      },
    ]);
  }

  function removeOption(index: number) {
    if (options.length <= 2) return;
    const newOptions = [...options];
    newOptions.splice(index, 1);
    setOptions(newOptions);
  }

  function updateOption(index: number, field: string, value: string | number) {
    const newOptions = [...options];
    newOptions[index] = {
      ...newOptions[index],
      [field]: value,
      updatedOn: nowIso(),
    };
    setOptions(newOptions);
  }

  return (
    <div className="bg-white relative block w-full rounded-lg border-1 border-gray-300 p-12 hover:border-gray-400 focus:outline-2 focus:outline-offset-2 focus:outline-indigo-600 ">
      <form
        onSubmit={handleSubmit}
        className="max-w-xl block mx-auto space-y-6"
      >
        <div>
          <h2 className="text-lg font-semibold">Edit scoring scale</h2>
          <p className="text-sm text-neutral-500">
            Modify the scoring scale for this project.
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
            placeholder="e.g., 1-5 Scale"
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
            placeholder="e.g., Description"
            rows={4}
            className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-900"
          />
        </div>

        {/* Options */}
        <div className="space-y-3">
          {options.map((option, index) => (
            <div key={option.id} className="flex gap-3 items-end">
              <div className="flex-1 space-y-1.5">
                <br />

                <label className="text-sm font-medium">
                  Label <span className="text-red-500">*</span>
                </label>

                <input
                  value={option.label}
                  onChange={(e) => updateOption(index, "label", e.target.value)}
                  placeholder="e.g., High"
                  className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-900"
                />
              </div>

              <div className="w-24 space-y-1.5">
                <label className="text-sm font-medium">
                  Value <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={option.value}
                  onChange={(e) =>
                    updateOption(index, "value", parseInt(e.target.value) || 0)
                  }
                  className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-900"
                />
              </div>

              {options.length > 2 && (
                <button
                  type="button"
                  onClick={() => removeOption(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              )}
            </div>
          ))}

          <div className="flex justify-center">
            <button type="button" onClick={addOption} className="submit_button">
              + Add option
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <button className="cancel_button" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="submit_button">
            {submitting ? "Updating…" : "Update scale"}
          </button>
        </div>
      </form>
    </div>
  );
}
