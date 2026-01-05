"use client"
import React, { useState, useMemo } from "react";
import { OutputOf } from "@/shared/ipc/types";
import type {
  NewDecisionDriver,
  DecisionDriver,
  ScoringScaleWithOptions,
} from "@/electron/db/schema";
import {
  useProjects,
  useDrivers,
  useScoringScales,
} from "@/app/context/DataContext";
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

export function CreateCriteriaFormLogic({
  onCancel,
}: CreateCriteriaFormLogicProps) {
  const { activeProjectId } = useProjects();
  const { refreshDrivers } = useDrivers();
  const { scoringScales } = useScoringScales();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [weight, setWeight] = useState(5);
  const [scaleId, setScaleId] = useState(scoringScales[0].id);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const errors = useMemo(() => {
    const e: Record<string, string> = {};

    if (!name.trim()) e.name = "Criteria name is required.";
    if (weight < 0 || weight > 10) {
      e.weight = "Weight must be between 0 and 100.";
    }
    if (!scaleId) {
      e.scaleId = "A scoring scale is required.";
    }

    return e;
  }, [name, weight, scaleId]);

  const canSubmit = Object.keys(errors).length === 0 && !submitting;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (!canSubmit) return;

    try {
      setSubmitting(true);

      const timestamp = nowIso();

      const payload: NewDecisionDriver = {
        id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}`,
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

      await window.api.drivers.create(payload);
    } catch (err) {
      setFormError("Failed to create decision criteria.");
    } finally {
      refreshDrivers();
      setSubmitting(false);
      onCancel();
    }
  }

  return {
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
  };
}

export function EditCriteriaFormLogic({
  onCancel,
  criteria,
}: EditCriteriaFormLogicProps) {
  const { activeProjectId } = useProjects();
  const { scoringScales } = useScoringScales();
  const { refreshDrivers } = useDrivers();

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

    return e;
  }, [name, weight, scaleId]);

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
        scaleId,
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

  return {
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
  };
}

export async function getScaleOptions(
  scaleId: string
): Promise<OutputOf<"scoringScaleOption:listByScale">> {
  const scoringScales = await window.api.scoringScaleOption.listByScale({
    scaleId: scaleId,
  });
  const result = unwrapIpcResult(scoringScales);
  return result;
}
