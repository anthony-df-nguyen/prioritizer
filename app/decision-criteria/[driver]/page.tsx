"use client";
import { useParams, useRouter } from "next/navigation";
import { useDrivers } from "@/app/context/DecisionDriverContext";
import { EditCriteriaForm } from "../forms/EditCriteria";

export default function ProjectPage() {
  const { driver } = useParams<{ driver: string }>();
  const { drivers, refreshDrivers } = useDrivers();

  const router = useRouter();
  const criteria = drivers.find((a) => a.id === driver);

  return (
    <div>
      {criteria && (
        <EditCriteriaForm
          criteria={criteria}
          onCancel={() => router.push(`/decision-criteria`)}
        />
      )}
    </div>
  );
}
