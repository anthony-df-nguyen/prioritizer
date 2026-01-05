import { ScoringScaleWithOptions } from "@/electron/db/schema";
import ReadScaleOptions from "./ReadScaleOptions";
import { useLayoutEffect, useRef } from "react";

type Props = {
  activeScaleId: string;
  scales: ScoringScaleWithOptions[];
  onClick: (e: string) => void;
};

const ScoringScaleCardSelect = ({ activeScaleId, scales, onClick }: Props) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeScaleRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const container = scrollRef.current;
    const active = activeScaleRef.current;
    if (!container || !active) return;

    const scrollToActive = () => {
      const containerRect = container.getBoundingClientRect();
      const activeRect = active.getBoundingClientRect();

      // Active's top relative to scroll container + current scrollTop
      const activeTop = activeRect.top - containerRect.top + container.scrollTop;

      // Put the active card a bit BELOW center so long cards near the bottom fully come into view.
      const bias = container.clientHeight * 0.10;
      const rawTarget =
        activeTop - container.clientHeight / 2 + active.offsetHeight / 2 + bias;

      // Clamp to valid scroll range
      const maxTop = Math.max(0, container.scrollHeight - container.clientHeight);
      const target = Math.min(Math.max(0, rawTarget), maxTop);

      container.scrollTo({ top: target, behavior: "auto" });
    };

    // 1) Do an immediate scroll before paint.
    scrollToActive();
    // 2) Then re-run after the next frame + a short delay in case card content expands (e.g. options load).
    requestAnimationFrame(scrollToActive);
    setTimeout(scrollToActive, 100);
  }, [activeScaleId, scales.length]);

  return (
    <div className="px-4 py-4 rounded-md border-gray-300 bg-gray-50">
      <div className="block text-sm/6 font-bold text-gray-800">
        Scoring Scale <span className="text-red-500">*</span>
      </div>
      <div className="text-sm mb-4">
        Choose the scale that will be used to score items for this criteria. You
        can create custom scoring scales later and change the scale used by this
        criteria at any time.
      </div>
      <div
        className="p-2 grid grid-cols-1 lg:grid-cols-1 gap-2 max-h-[500px] overflow-y-scroll"
        ref={scrollRef}
      >
        {/* Cards */}
        {scales.map((s) => {
          const active = activeScaleId === s.id;
          return (
            <div
              key={s.id}
              ref={active ? activeScaleRef : null}
              onClick={() => onClick(s.id)}
              className={`flex-1 p-4 cursor-pointer rounded-md bg-white shadow border-gray-300 ${
                active
                  ? "border-2 border-indigo-400"
                  : "bg-gray-100 opacity-60 hover:opacity-100"
              }`}
            >
              <div className="text-sm font-bold">{s.name}</div>
              <div className="text-sm mt-2 text-gray-600 ">{s.description}</div>
              <div className="mt-4 max-h-[200px] overflow-clip">
                <ReadScaleOptions scaleId={s.id} scales={scales} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ScoringScaleCardSelect;
