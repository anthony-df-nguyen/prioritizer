"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import PageHeader from "../components/AppShell/PageHeader";
import Card from "../components/UI/Card";
import { CreateScaleForm } from "./CreateScale";
import { useScoringScales } from "../context/ScoringScaleContext";
import { useRouter } from "next/navigation";

export default function Scales() {
  const { scoringScales, refreshScoringScales } = useScoringScales();
  //console.log("scoringScales: ", scoringScales);

  const [createMode, handleCreateMode] = useState<boolean>(false);

  const toggleCreate = () => {
    createMode ? handleCreateMode(false) : handleCreateMode(true);
  };

  const router = useRouter();
  const goToScaleEditPage = (scaleId: string) => {
    console.log(`Going to the edit page for scale id ${scaleId}`);
    router.push(`/scales/${scaleId}?edit=true`);
  };

  return (
    <main className="space-y-6">
      <PageHeader
        title="Scales"
        actionButton
        actionText="+ New Scale"
        onActionClick={toggleCreate}
        description={
          <>
            A Scoring Scale defines the set of values used to score an item for
            a specific{" "}
            <Link href="/decision-criteria" className="text-indigo-500">
              decision criteria
            </Link>
            . It provides consistent, repeatable options (for exasmple, 1–5 or
            Low → High) so items can be compared objectively and combined into
            an overall priority score.
          </>
        }
      />

      {createMode && (
        <CreateScaleForm
          onCancel={() => handleCreateMode(false)}
          existingNames={scoringScales.map((s) => s.name)}
        />
      )}

      {/* Scales List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {scoringScales.map((s) => (
          <Card
            key={s.id}
            title={s.name}
            hypertext="Scale"
            onEditClick={() => goToScaleEditPage(s.id)}
          >
            <div className="space-y-6">
              <div>
                <div className="text-neutral-600 text-xs">Description</div>
                <div>{s.description || "No description provided"}</div>
              </div>
              <div className="flex gap-4 justify-between">
                <div>
                  <div className="text-neutral-600 text-xs">Created</div>
                  <div className="text-xs">
                    {new Date(s.createdOn).toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-neutral-600 text-xs">Updated</div>
                  <div className="text-xs">
                    {new Date(s.updatedOn).toLocaleString()}
                  </div>
                </div>
              </div>
              <div>
                <div className=" text-neutral-600 text-xs">Scoring Options</div>
                {s.options.map((o) => (
                  <div
                    key={o.id}
                    className="font-mono text-sm flex items-center justify-between gap-1"
                  >
                    <div> {o.label}</div>
                    <div>{o.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </main>
  );
}
