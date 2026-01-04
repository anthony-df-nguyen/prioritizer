"use client";
import { useState } from "react";
import PageHeader from "../components/AppShell/PageHeader";
import { useDrivers } from "../context/DecisionDriverContext";
import { useRouter } from "next/navigation";
import { useScoringScales } from "../context/ScoringScaleContext";
import { CreateCriteriaForm } from "./CreateCriteria";
import Card from "../components/UI/Card";


export default function DecisionCriteria() {
  const { drivers, refreshDrivers } = useDrivers();
  const { scoringScales } = useScoringScales();
  const [createMode, handleCreateMode] = useState<boolean>(false);

  const toggleCreate = () => {
    createMode ? handleCreateMode(false) : handleCreateMode(true);
  };

  const findScaleName = (scaleId: string) => {
    const scale = scoringScales.find((s) => s.id === scaleId);
    return scale ? scale.name : scaleId;
  };
  const router = useRouter();

  return (
    <main className="space-y-6">
      <PageHeader
        title="Decision Criteria"
        actionButton
        actionText="+ New Criteria"
        description="Decision Criteria are the factors used to evaluate and compare items within a project. Each criterion represents what matters most (such as impact, effort, or risk) and is typically weighted to reflect its relative importance in the final priority score."
        onActionClick={toggleCreate}
      />
      {createMode && (
        <CreateCriteriaForm
          onCreate={async (payload) => {
            await window.api.drivers.create(payload);
            refreshDrivers();
          }}
          onCancel={() => handleCreateMode(false)}
        />
      )}
      {/* Drivers */}
      <div className="gap-4 grid lg:grid-cols-2">
        {drivers.map((d) => (
          <Card
            key={d.id}
            title={d.name}
            hypertext="Criteria"
            onEditClick={() => router.push(`/decision-criteria/${d.id}`)}
            selected={false}
            active={d.archived === 0 ? true : false}
          >
            <div>
              <div>
                <div className="text-neutral-600 text-xs">Description</div>
                <div>{d.description || ""}</div>
              </div>
              <br />
              <div>
                <div className="text-neutral-600 text-xs">Uses Scale</div>
                <div>{findScaleName(d.scaleId) || "No scale"}</div>
              </div>
              <div className="flex gap-4 justify-between mt-6">
                <div>
                  {" "}
                  <div className="text-neutral-600 text-xs">Created On</div>
                  <div className="text-xs">
                    {new Date(d.createdOn).toLocaleString()}
                  </div>
                </div>
                <div>
                  {" "}
                  <div className="text-neutral-600 text-xs">Updated On</div>
                  <div className="text-xs">
                    {new Date(d.updatedOn).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </main>
  );
}
