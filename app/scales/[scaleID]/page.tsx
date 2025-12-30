"use client";
import { useParams } from "next/navigation";
import { EditScaleForm } from "../EditScale";
import { useScoringScales } from "@/app/context/ScoringScaleContext";
import { useRouter } from "next/navigation";
import { ScoringScaleWithOptions } from "@/electron/db/schema";

export default function EditScalePage() {
  const router = useRouter();
  const { scoringScales } = useScoringScales();
  const { scaleID } = useParams<{ scaleID: string }>();
  const scale = scoringScales.find((s) => s.id === scaleID);
  return (
    <div>
      {scale && (
        <EditScaleForm
          scale={scale as ScoringScaleWithOptions}
          onCancel={() => router.push("/scales")}
        />
      )}
    </div>
  );
}
