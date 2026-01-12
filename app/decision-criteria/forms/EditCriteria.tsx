import React from "react";
import {
  Text,
  TextArea,
  Select,
  Toggle,
  Slider,
} from "../../components/UI/Inputs/";
import type { DecisionDriver } from "@/electron/db/schema/drivers";
import { useCriteriaFormLogic } from "./logic";

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
    archived,
    setArchived,
    submitting,
    formError,
    options,
    addOption,
    updateOption,
    removeOption,
    errors,
    canSubmit,
    handleSubmit,optionsLoaded
  } = useCriteriaFormLogic({ onCancel, criteria });

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
        {/* Options */}
        <div>
          <div className="font-bold text-gray-800">Scoring Options</div>
          <p className="text-sm text-neutral-500">
            Scoring options are the choices you can pick when scoring an item to
            this driver.
          </p>
          <div className="mt-4 space-y-3 p-4 bg-gray-100 rounded-lg">
            {!optionsLoaded && <div>Options Loading ...</div>}
            {optionsLoaded && options.map((option, index) => (
              <div key={option.id} className="flex gap-3 items-end">
                <div className="flex-1 space-y-1.5">
                  <Text
                    key={option.id + index}
                    label={`Label`}
                    value={option.label}
                    onChange={(e) =>
                      updateOption(index, "label", e.target.value)
                    }
                    placeholder="e.g., High"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Text
                    required
                    key={option.id + index}
                    label={"Value"}
                    type="number"
                    value={option.value}
                    onChange={(e) =>
                      updateOption(
                        index,
                        "value",
                        parseInt(e.target.value) || 0
                      )
                    }
                    placeholder={"Number"}
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
              <button
                type="button"
                onClick={addOption}
                className="button bgPrimary bgHover"
              >
                + Add option
              </button>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <button className="button bgCancel bgHover" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" disabled={!canSubmit} className="button bgPrimary bgHover">
            {submitting ? "Updating…" : "Update Criteria"}
          </button>
        </div>
      </form>
    </div>
  );
}
