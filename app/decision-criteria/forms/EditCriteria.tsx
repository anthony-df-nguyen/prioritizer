import React from "react";
import {
  Text,
  TextArea,
  Select,
  Toggle,
  Slider,
} from "../../components/UI/Inputs/";
import type { DecisionDriver } from "@/electron/db/schema/drivers";
import { EditCriteriaFormLogic } from "./logic";
import ScoringScaleCardSelect from "./ScoringScaleCardSelect";

type EditCriteriaFormProps = {
  onCancel: () => void;
  /** The criteria to edit */
  criteria: DecisionDriver;
  /** Optional: if you want to validate uniqueness client-side */
  existingNames?: string[];
};

export function EditCriteriaForm({
  onCancel,
  criteria,
}: EditCriteriaFormProps) {
  const {
    name,
    setName,
    description,
    setDescription,
    weight,
    setWeight,
    scaleId,
    setScaleId,
    archived,
    setArchived,
    submitting,
    formError,
    setFormError,
    errors,
    canSubmit,
    handleSubmit,
    scoringScales,
  } = EditCriteriaFormLogic({ onCancel, criteria });

  return (
    <div className="bg-white relative block w-full rounded-lg border-1 border-gray-300 p-12 hover:border-gray-400 focus:outline-2 focus:outline-offset-2 focus:outline-indigo-600 cursor-pointer">
      <form
        onSubmit={handleSubmit}
        className="max-w-3xl block mx-auto space-y-6"
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
          <Text
            label="Name"
            placeholder="e.g., Impact"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            error={!!errors.name}
            errorText={errors.name}
          />
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <TextArea
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe how items should be evaluated on this criteria"
          />
        </div>

        {/* Active */}
        <div className="space-y-1.5">
          <Toggle
            name="Active"
            label="Active"
            checked={!archived}
            onChange={(e) => setArchived(!e.target.checked)}
          />
        </div>

        {/* Weight */}
        <div className="space-y-1.5">
          <Slider
            label="Weight"
            required
            value={weight}
            onChange={setWeight}
            min={1}
            max={10}
            error={!!errors.weight}
            errorText={errors.weight}
            helpText="How much this criteria influences the final decision"
          />
        </div>

        {/* Scale */}
        <ScoringScaleCardSelect
          activeScaleId={scaleId as string}
          scales={scoringScales}
          onClick={(e) => {
            setScaleId(e);
          }}
        />
        {/* <div className="space-y-1.5 p-6 border rounded-md  border-gray-300">
          <Select<string>
            label="Scoring Scale"
            required
            helpText="Choose the scale that will be used to score items for this criteria.
            You can create custom scoring scales later and change the scale used
            by this criteria at any time."
            value={scaleId as string}
            onChange={(e) => {
              setScaleId(e);
            }}
            options={scoringScales.map((s) => ({
              label: s.name,
              value: s.id,
              key: s.id,
            }))}
            error={!!errors.scaleId}
            errorText={errors.scaleId}
          />
          <div className="mt-4">
            <ReadScaleOptions scaleId={scaleId as string} scales={scoringScales} />
          </div>
        </div> */}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <button className="cancel_button" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" disabled={!canSubmit} className="submit_button">
            {submitting ? "Updating…" : "Update Criteria"}
          </button>
        </div>
      </form>
    </div>
  );
}
