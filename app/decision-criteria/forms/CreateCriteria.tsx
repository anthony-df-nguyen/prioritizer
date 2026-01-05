"use client";
import { Text, TextArea, Select, Slider } from "@/app/components/UI/Inputs";
import ReadScaleOptions from "./ReadScaleOptions";
import { CreateCriteriaFormLogic } from "./logic";
import ScoringScaleCardSelect from "./ScoringScaleCardSelect";

type CreateCriteriaFormProps = {
  onCancel: () => void;
};

export function CreateCriteriaForm({ onCancel }: CreateCriteriaFormProps) {
  const {
    name,
    setName,
    description,
    setDescription,
    weight,
    setWeight,
    scaleId,
    setScaleId,
    submitting,
    formError,
    setFormError,
    errors,
    canSubmit,
    handleSubmit,
    scoringScales,
  } = CreateCriteriaFormLogic({ onCancel });

  return (
    <div className="bg-white relative block  rounded-lg border-1 border-gray-300 p-12 hover:border-gray-400 focus:outline-2 focus:outline-offset-2 focus:outline-indigo-600">
      <form
        onSubmit={handleSubmit}
        className="block space-y-6 mx-auto max-w-3xl"
      >
        <div>
          <h2 className="text-lg font-semibold">Create Scoring Criteria</h2>
          <p className="text-sm text-neutral-400 ">
            Scoring Criteria define how items are evaluated during
            prioritization. Each criterion represents a dimension—such as
            impact, effort, or risk—that items will be scored against.
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

        {/* Weight */}
        <div className="space-y-1.5">
          <Slider
            label="Weight"
            required
            value={weight}
            onChange={setWeight}
            min={0}
            max={10}
            error={!!errors.weight}
            errorText={errors.weight}
            helpText="How much this criteria influences the final decision"
          />
        </div>

        {/* Scale */}
        <ScoringScaleCardSelect
          activeScaleId={scaleId}
          scales={scoringScales}
          onClick={(e) => {
            setScaleId(e);
          }}
        />

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <button className="cancel_button" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" disabled={!canSubmit} className="submit_button">
            {submitting ? "Creating…" : "Create Criteria"}
          </button>
        </div>
      </form>
    </div>
  );
}
