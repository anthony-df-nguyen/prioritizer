import React, { useEffect, useMemo, useState } from "react";
import { Select } from "../components/UI/Select";
import type { NewDecisionDriver } from "@/electron/db/schema/drivers";
import { useProjects } from "@/app/context/ProjectContext";
import { useScoringScales } from "@/app/context/ScoringScaleContext";

type CreateCriteriaFormProps = {
  /** Call your IPC / API here. Return the created driver or void. */
  onCreate: (payload: NewDecisionDriver) => Promise<void> | void;
  onCancel: () => void;
  /** Optional: if you want to validate uniqueness client-side */
  existingNames?: string[];
};

function nowIso() {
  return new Date().toISOString();
}

export function CreateCriteriaForm({
  onCreate,
  onCancel,
  existingNames = [],
}: CreateCriteriaFormProps) {
  const { activeProjectId } = useProjects();
  const { scoringScales } = useScoringScales();
  const existingSet = useMemo(
    () => new Set(existingNames.map((s) => s.toLowerCase())),
    [existingNames]
  );

  const [name, setName] = useState("");
  const [description, setDescription] = useState("")
  const [weight, setWeight] = useState(50);
  const [scaleId, setScaleId] = useState("");

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

    if (existingSet.has(name.trim().toLowerCase())) {
      e.name = "A criteria with this name already exists in this project.";
    }

    return e;
  }, [name, weight, scaleId, existingSet]);

  const canSubmit = Object.keys(errors).length === 0 && !submitting;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (!canSubmit) return;

    try {
      setSubmitting(true);

      const timestamp = nowIso();

      const payload: NewDecisionDriver = {
        id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}`, // fallback
        projectId: activeProjectId as string,
        scaleId,
        name: name.trim(),
        description,
        weight,
        createdOn: timestamp,
        updatedOn: timestamp,
        archived: 0,
        archivedOn: null,
      };
      console.log("Submitting payload: ", payload);

      await onCreate(payload);
    } catch (err) {
      setFormError("Failed to create decision criteria.");
    } finally {
      setSubmitting(false);
      onCancel();
    }
  }

  return (
    <div className="bg-white relative block w-full rounded-lg border-1 border-gray-300 p-12 hover:border-gray-400 focus:outline-2 focus:outline-offset-2 focus:outline-indigo-600 cursor-pointer">
      <form
        onSubmit={handleSubmit}
        className="max-w-xl block mx-auto space-y-6"
      >
        <div>
          <h2 className="text-lg font-semibold">Create decision criteria</h2>
          <p className="text-sm text-neutral-500">
            Define a new decision criteria for this project.
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
          <label className="text-sm font-medium">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g.,Description"
            rows={4}
            className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-900"
          />
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
            value={scoringScales.length > 0 ? scoringScales[0].id : ""}
            onChange={(e) => {
              setScaleId(e);
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
            {submitting ? "Creating…" : "Create criteria"}
          </button>
        </div>
      </form>
    </div>
  );
}
