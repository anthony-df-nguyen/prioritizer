import { useMemo, useState } from "react";
import { unwrapIpcResult } from "@/shared/ipc/unwrap";
import {
  useProjects,
  useScoringScales,
  useItems,
} from "@/app/context/DataContext";
import type {
  NewScoringScale,
  ScoringScaleOption,
  ScoringScaleWithOptions,
} from "@/electron/db/schema/scoringScales";

function nowIso() {
  return new Date().toISOString();
}

// Create Scale Logic
type UseCreateScaleLogicProps = {
  onCancel: () => void;
  existingNames?: string[];
};

export function useCreateScaleLogic({
  onCancel,
  existingNames = [],
}: UseCreateScaleLogicProps) {
  const existingSet = useMemo(
    () => new Set(existingNames.map((s) => s.toLowerCase())),
    [existingNames]
  );
  const { activeProjectId } = useProjects();
  const { refreshScoringScales } = useScoringScales();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [options, setOptions] = useState([
    { id: "3", label: "High", value: 3 },
    { id: "2", label: "Medium", value: 2 },
    { id: "1", label: "Low", value: 1 },
  ]);
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

  const canSubmit = Object.keys(errors).length === 0 && !submitting;

  function addOption() {
    setOptions([
      ...options,
      { id: `${Date.now()}`, label: "", value: options.length + 1 },
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
    newOptions[index] = { ...newOptions[index], [field]: value };
    setOptions(newOptions);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (!canSubmit) return;

    try {
      setSubmitting(true);

      const timestamp = nowIso();

      // Create the scale first
      const scalePayload: NewScoringScale = {
        id: globalThis.crypto?.randomUUID?.() ?? `scale-${Date.now()}`,
        projectId: activeProjectId as string,
        name: name.trim(),
        description: description?.trim() || null,
        createdOn: timestamp,
        updatedOn: timestamp,
        archived: 0,
        archivedOn: null,
      };

      // Create the scale
      const createdScale = unwrapIpcResult(
        await window.api.scoringScales.create(scalePayload)
      );

      // If we have a createdScale with an ID, create the options
      if (createdScale && createdScale.id) {
        // Create options for this scale
        const optionsPayload = options.map((option, index) => ({
          scaleId: createdScale.id,
          label: option.label.trim(),
          value: option.value,
          sortOrder: index,
          createdOn: timestamp,
          updatedOn: timestamp,
        }));

        // Create each option individually (since you don't have createMany)
        for (const option of optionsPayload) {
          await window.api.scoringScaleOption.create(option);
        }
      }
    } catch (err) {
      setFormError("Failed to create scoring scale.");
      console.error("Error creating scale:", err);
    } finally {
      refreshScoringScales();
      setSubmitting(false);
      onCancel();
    }
  }

  return {
    name,
    setName,
    description,
    setDescription,
    options,
    setOptions,
    errors,
    canSubmit,
    submitting,
    setSubmitting,
    formError,
    setFormError,
    addOption,
    removeOption,
    updateOption,
    handleSubmit,
  };
}

// Edit Scale Logic
type UseEditScaleLogicProps = {
  scale: ScoringScaleWithOptions;
  onCancel: () => void;
  existingNames?: string[];
};

export function useEditScaleLogic({
  scale,
  onCancel,
  existingNames = [],
}: UseEditScaleLogicProps) {
  const existingSet = useMemo(
    () => new Set(existingNames.map((s) => s.toLowerCase())),
    [existingNames]
  );

  const { activeProjectId } = useProjects();
  const { refreshScoringScales } = useScoringScales();
  const { refreshItems } = useItems();
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

  return {
    name,
    setName,
    description,
    setDescription,
    options,
    setOptions,
    errors,
    submitting,
    setSubmitting,
    formError,
    setFormError,
    addOption,
    removeOption,
    updateOption,
    handleSubmit,
  };
}
