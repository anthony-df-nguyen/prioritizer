import type { NewProject } from "@/electron/db/schema/projects";
import { CreateProjectFormLogic } from "./logic";
import { Text, TextArea } from "@/app/components/UI/Inputs";

type CreateProjectFormProps = {
  onCancel: () => void;
};

export function CreateProjectForm({
  onCancel,
}: CreateProjectFormProps) {
  const {
    name,
    setName,
    shortId,
    setShortId,
    description,
    setDescription,
    shortIdTouched,
    setShortIdTouched,
    submitting,
    setSubmitting,
    formError,
    setFormError,
    errors,
    canSubmit,
    handleSubmit,
  } = CreateProjectFormLogic({ onCancel });

  return (
    <div className="bg-white relative block w-full rounded-lg border-1 border-gray-300 p-12  hover:border-gray-400 focus:outline-2 focus:outline-offset-2 focus:outline-indigo-600 cursor-pointer">
      {" "}
      <form
        onSubmit={handleSubmit}
        className="max-w-xl block mx-auto space-y-6"
      >
        <div>
          <h2 className="text-lg font-semibold">Create Folder</h2>
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
              setShortIdTouched(true);
              setShortId(e.target.value);
            }}
            placeholder="e.g., q1-growth"
            error={!!errors.shortId}
            errorText={errors.shortId}
            onBlur={() => setShortIdTouched(true)}
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
          <button className="cancel_button" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" disabled={!canSubmit} className="submit_button">
            {submitting ? "Creating…" : "Create Folder"}
          </button>
        </div>
      </form>
    </div>
  );
}
