// app/decision-criteria/forms/logic.ts
"use client";
import React, { useState, useEffect, useMemo } from "react";
import { OutputOf } from "@/shared/ipc/types";
import type {
  NewDecisionDriver,
  DecisionDriver,
  ScoringScaleOption,
} from "@/electron/db/schema";
import { useProjects, useDrivers, useItems } from "@/app/context/DataContext";
import { unwrapIpcResult } from "@/shared/ipc/unwrap";

type CreateCriteriaFormLogicProps = {
  onCancel: () => void;
};

type EditCriteriaFormLogicProps = {
  onCancel: () => void;
  criteria: DecisionDriver;
  existingNames?: string[];
};

function nowIso() {
  return new Date().toISOString();
}

const hmlHigherIsBetter: ScoringScaleOption[] = [
  {
    id: "random_1",
    createdOn: nowIso(),
    updatedOn: nowIso(),
    label: "High",
    value: 3,
    sortOrder: 0,
  },
  {
    id: "random_2",
    createdOn: nowIso(),
    updatedOn: nowIso(),
    label: "Medium",
    value: 2,
    sortOrder: 1,
  },
  {
    id: "random_3",
    createdOn: nowIso(),
    updatedOn: nowIso(),
    label: "Low",
    value: 1,
    sortOrder: 2,
  },
];

export async function getScaleOptions(
  driverId: string
): Promise<OutputOf<"scoringScaleOption:listByDriver">> {
  const scoringScales = await window.api.scoringScaleOption.listByDriver({
    driverId: driverId,
  });
  const result = unwrapIpcResult(scoringScales);
  return result;
}

export function useCriteriaFormLogic({
  onCancel,
  criteria,
}: CreateCriteriaFormLogicProps & Partial<EditCriteriaFormLogicProps>) {
  const { activeProjectId } = useProjects();
  const {refreshItems} = useItems()
  const { refreshDrivers } = useDrivers();

  const [name, setName] = useState(criteria?.name || "");
  const [description, setDescription] = useState(criteria?.description || "");
  const [weight, setWeight] = useState(criteria?.weight || 5);
  const [options, setOptions] = useState<ScoringScaleOption[]>(
    criteria?.id ? [] : hmlHigherIsBetter
  );
  //console.log("options: ", options);
  const [optionsLoaded, setOptionsLoaded] = useState(false);

  useEffect(() => {
    // If edit mode, go get the existing scaleOptions
    if (criteria?.id) {
      getScaleOptions(criteria.id).then((fetchedOptions) => {
        setOptions(fetchedOptions);
        setOptionsLoaded(true);
      });
    }
  }, [criteria?.id]);

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [archived, setArchived] = useState(criteria?.archived === 1 || false);

  const errors = useMemo(() => {
    const e: Record<string, string> = {};

    if (!name.trim()) e.name = "Criteria name is required.";
    if (weight < 0 || weight > 100) {
      e.weight = "Weight must be between 0 and 100.";
    }

    // Only validate options in create mode
    if (!criteria?.id) {
      options.forEach((option, index) => {
        if (!option.label.trim()) {
          e[`option-label-${index}`] = "Option label is required.";
        }
        if (option.value === undefined || option.value === null) {
          e[`option-value-${index}`] = "Option value is required.";
        }
      });
    }

    return e;
  }, [name, weight, options, criteria?.id]);

  const canSubmit = Object.keys(errors).length === 0 && !submitting;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (!canSubmit) return;

    try {
      setSubmitting(true);

      if (criteria?.id) {
        // Edit mode - update driver with options
        const timestamp = nowIso();

        // Prepare options for update - include existing IDs for options that should be updated
        const optionsForUpdate = options.map((option) => {
          // If option has an ID, keep it (it's an existing option that should be updated)
          // If it doesn't have an ID, it's a new option that will be created
          if (option.id && option.id.startsWith("temp-")) {
            // This is a temporary ID, remove it so backend can create new one
            const { id, ...optionWithoutId } = option;
            return optionWithoutId;
          }
          return option;
        });

        const payload: Partial<DecisionDriver> & {
          scoringOptions?: Pick<
            ScoringScaleOption,
            "label" | "value" | "sortOrder"
          >[];
        } = {
          id: criteria.id,
          projectId: activeProjectId as string,
          name: name.trim(),
          description,
          weight,
          updatedOn: timestamp,
          archived: archived ? 1 : 0,
          scoringOptions: optionsForUpdate,
        };

        await window.api.drivers.update(payload);
      } else {
        // Create mode - simplified
        const timestamp = nowIso();

        // Filter out temp IDs and let backend generate UUIDs
        const optionsWithoutIds = options.map((option) => {
          const { id, ...optionWithoutId } = option;
          return optionWithoutId;
        });

        const payload: NewDecisionDriver & {
          scoringOptions?: Pick<
            ScoringScaleOption,
            "label" | "value" | "sortOrder"
          >[];
        } = {
          id: globalThis.crypto?.randomUUID?.(),
          projectId: activeProjectId as string,
          name: name.trim(),
          description,
          weight,
          createdOn: timestamp,
          updatedOn: timestamp,
          archived: 0,
          archivedOn: null,
          scoringOptions: optionsWithoutIds, // Pass options without IDs
        };

        await window.api.drivers.create(payload);
      }

      refreshDrivers();
      refreshItems();
      onCancel();
    } catch (err) {
      setFormError(
        criteria?.id
          ? "Failed to update decision criteria."
          : "Failed to create decision criteria."
      );
      console.error("Form submission failed:", err);
    } finally {
      setSubmitting(false);
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
    weight,
    setWeight,
    archived,
    setArchived,
    submitting,
    formError,
    setFormError,
    errors,
    canSubmit,
    handleSubmit,
    options,
    addOption,
    removeOption,
    updateOption,
    optionsLoaded,
  };
}
