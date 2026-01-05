"use client";
import { useState, useEffect } from "react";
import {
  ScoringScaleOption,
  type ScoringScaleWithOptions,
} from "@/electron/db/schema";
import { getScaleOptions } from "./logic";
import Link from "next/link";
type Props = {
  scaleId: string;
  scales: ScoringScaleWithOptions[];
};

const ReadScaleOptions = ({ scaleId, scales }: Props) => {
  const [data, setData] = useState<ScoringScaleOption[]>([]);
  const [scale, setScale] = useState<ScoringScaleWithOptions | undefined>(
    undefined
  );

  useEffect(() => {
    const load = async () => {
      const options = await getScaleOptions(scaleId);
      setData(options);
    };
    const getDescription = () => {
      const scale = scales.find((a) => a.id === scaleId);
      setScale(scale);
    };

    load();
    getDescription();
  }, [scaleId, scales]);

  return (
    <div className="flex flex-row flex-wrap gap-2 ">
      {data.map((d) => (
        <div key={d.id} className="bg-gray-100 p-2 rounded flex flex-auto items-center gap-2 font-mono text-sm">
          <div>{d.label} =</div> <div>{d.value}</div>
        </div>
      ))}
    </div>
  );
};

export default ReadScaleOptions;
