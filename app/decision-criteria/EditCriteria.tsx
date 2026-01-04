import React, { useEffect, useMemo, useState } from "react";
import { Select } from "../components/UI/Select";
import { DecisionDriver } from "@/electron/db/schema";
import { DriverWithScores, useDrivers } from "../context/DecisionDriverContext";
import { useProjects } from "@/app/context/ProjectContext";
import { useScoringScales } from "@/app/context/ScoringScaleContext";

type EditCriteriaFormProps = {
  onCancel: () => void;
  /** The criteria to edit */
  criteria: DriverWithScores;
  /** Optional: if you want to validate uniqueness client-side */
  existingNames?: string[];
};

function nowIso() {
  return new Date().toISOString();
}

export function EditCriteriaForm({
  onCancel,
  criteria,
  existingNames = [],
}: EditCriteriaFormProps) {
  const { activeProjectId } = useProjects();
  const { scoringScales } = useScoringScales();
  const { refreshDrivers } = useDrivers();
  const existingSet = useMemo(
    () => new Set(existingNames.map((s) => s.toLowerCase())),
    [existingNames]
  );

  const [name, setName] = useState(criteria.name);
  const [description, setDescription] = useState(criteria.description || "");
  const [weight, setWeight] = useState(criteria.weight);
  const [scaleId, setScaleId] = useState<string | null>(
    criteria.scaleId ?? null
  );
  const [archived, setArchived] = useState(criteria.archived === 1);

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const errors = useMemo(() => {
    const e: Record<string, string> = {};

    if (!name.trim()) e.name = "Criteria name is required.";

    if (weight < 0 || weight > 100) {
      e.weight = "Weight must be between 0 and 100.";
    }

    if (!scaleId) {
      e.scaleId = "A scoring scale is required.";
    }

    // Check for duplicate name, but exclude the current criteria being edited
    const nameToLower = name.trim().toLowerCase();
    if (
      existingSet.has(nameToLower) &&
      nameToLower !== criteria.name.toLowerCase()
    ) {
      e.name = "A criteria with this name already exists in this project.";
    }

    return e;
  }, [name, weight, scaleId, existingSet, criteria.name]);

  const canSubmit = Object.keys(errors).length === 0 && !submitting;
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (!canSubmit) return;

    try {
      setSubmitting(true);

      // Validate scaleId is not null before proceeding
      if (!scaleId) {
        throw new Error("Scale ID is required");
      }

      const payload: Partial<DecisionDriver> = {
        id: criteria.id,
        projectId: activeProjectId as string,
        scaleId, // This is now properly set
        name: name.trim(),
        description,
        weight,
        updatedOn: nowIso(),
        archived: archived ? 1 : 0,
      };

      console.log("Sending update payload:", payload);

      await window.api.drivers.update(payload);
      refreshDrivers();
      onCancel();
    } catch (err) {
      setFormError("Failed to update decision criteria.");
      console.error("Update failed:", err);
    } finally {
      setSubmitting(false);
    }
  }
  return (
    <div className="bg-white relative block w-full rounded-lg border-1 border-gray-300 p-12 hover:border-gray-400 focus:outline-2 focus:outline-offset-2 focus:outline-indigo-600 cursor-pointer">
      <form
        onSubmit={handleSubmit}
        className="max-w-xl block mx-auto space-y-6"
      >
        <div>
          <h2 className="text-lg font-semibold">Edit decision criteria</h2>
          <p className="text-sm text-neutral-500">
            Update the details for this decision criteria.
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
            placeholder="e.g., Strategic Alignment"
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
        {/* Active */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={!archived}
              onChange={(e) => setArchived(!e.target.checked)}
              className="form-checkbox h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
            />
            <span>Active</span>
          </label>
        </div>

        {/* Weight */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium">
            Weight <span className="text-red-500">*</span>
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={weight}
            onChange={(e) => setWeight(parseInt(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-sm">
            <span>0%</span>
            <span className="font-medium">{weight}%</span>
            <span>100%</span>
          </div>
          {errors.weight && <p className="error_text">{errors.weight}</p>}
        </div>

        {/* Scale */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium">
            Scoring Scale <span className="text-red-500">*</span>
          </label>
          <Select<string>
            label={undefined}
            value={scaleId || undefined}
            onChange={(value) => {
              setScaleId(value || null);
            }}
            options={scoringScales.map((s) => ({
              label: s.name,
              value: s.id,
              key: s.id,
            }))}
          />
          {errors.scaleId && <p className="error_text">{errors.scaleId}</p>}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <button className="cancel_button" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" disabled={!canSubmit} className="submit_button">
            {submitting ? "Updating…" : "Update criteria"}
          </button>
        </div>
      </form>
    </div>
  );
}
