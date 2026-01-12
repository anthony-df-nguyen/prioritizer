"use client"
import { useCreateItemLogic } from "./logic";

type CreateItemFormProps = {
  onCancel: () => void;
};

export function CreateItemForm({
  onCancel,
}: CreateItemFormProps) {
  const {
    name,
    setName,
    description,
    setDescription,
    errors,
    submitting,
    setSubmitting,
    formError,
    setFormError,
    canSubmit,
    handleSubmit
  } = useCreateItemLogic({onCancel});

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
          <button className="button bgCancel bgHover" onClick={onCancel}>
            Cancel
          </button>
          <button
            type="submit"
            disabled={!canSubmit}
            className="button bgPrimary bgHover"
          >
            {submitting ? "Creating…" : "Create item"}
          </button>
        </div>
      </form>
    </div>
  );
}