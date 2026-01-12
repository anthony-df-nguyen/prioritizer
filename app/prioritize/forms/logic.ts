import { useMemo, useState } from "react";
import { useItems } from "../../context/ItemsContext";
import { useProjects } from "../../context/ProjectContext";
import { NewItem } from "@/electron/db/schema";

function nowIso() {
  return new Date().toISOString();
}

type UseCreateItemLogicProps = {
  /** Call your IPC / API here. Return the created item or void. */
  onCancel: () => void;
};

export function useCreateItemLogic({ onCancel }: UseCreateItemLogicProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const { refreshItems } = useItems();
  const { activeProjectId } = useProjects();

  const errors = useMemo(() => {
    const e: Record<string, string> = {};

    if (!name.trim()) e.name = "Item name is required.";

    if (description.length > 500)
      e.description = "Description is too long (max 500 chars).";

    return e;
  }, [name, description]);

  const canSubmit = Object.keys(errors).length === 0 && !submitting;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (!canSubmit) return;

    try {
      setSubmitting(true);

      const timestamp = nowIso();

      const payload: NewItem = {
        id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}`, // fallback
        projectId: activeProjectId as string,
        name: name.trim(),
        description: description.trim() ? description.trim() : null,
        createdOn: timestamp,
        updatedOn: timestamp,
        archived: 0,
        archivedOn: null,
      };
      await window.api.items.create(payload);
      refreshItems();
    } catch (err) {
      setFormError("Failed to create item.");
    } finally {
      setSubmitting(false);
      onCancel();
    }
  }

  return {
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
    handleSubmit,
  };
}
