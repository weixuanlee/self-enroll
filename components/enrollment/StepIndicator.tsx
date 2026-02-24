import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepIndicatorProps {
  currentStep: number; // 1-based
  steps: string[];
}

const StepIndicator = ({ currentStep, steps }: StepIndicatorProps) => {
  const total = steps.length;
  const clamped = Math.min(Math.max(currentStep, 1), total);

  // circle size & gap control (match screenshot)
  const CIRCLE = 40; // px (h-10 w-10)
  const GAP = 100; // px space between circle edge and track

  return (
    <div className="w-full max-w-3xl mx-auto mb-10">
      <div className="relative">
        {/* Steps row */}
        <div className="relative flex items-start justify-between">
          {steps.map((label, idx) => {
            const stepNumber = idx + 1;
            const isCompleted = stepNumber < clamped;
            const isActive = stepNumber === clamped;

            return (
              <div key={label} className="flex flex-col items-center gap-2">
                {/* Circle */}
                <div
                  className={cn(
                    "relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-semibold",
                    isCompleted && "bg-[#22C55E] border-[#22C55E] text-white",
                    isActive && "bg-[#0982BE] border-[#0982BE] text-white",
                    !isCompleted &&
                      !isActive &&
                      "bg-white border-[#CFE2F2] text-[#94A3B8]"
                  )}
                >
                  {isCompleted ? <Check className="h-5 w-5" /> : stepNumber}
                </div>

                {/* Label */}
                <span
                  className={cn(
                    "text-sm font-semibold leading-tight text-center",
                    isCompleted && "text-[#16A34A]",
                    isActive && "text-[#0284C7]",
                    !isCompleted && !isActive && "text-[#94A3B8]"
                  )}
                >
                  {label}
                </span>
              </div>
            );
          })}

          {/* Track segments BETWEEN circles (so it won’t touch circles) */}
          {steps.length > 1 && (
            <>
              {Array.from({ length: steps.length - 1 }).map((_, segIdx) => {
                // segment from step segIdx -> segIdx+1
                const leftPercent = (segIdx / (steps.length - 1)) * 100;
                const rightPercent = ((segIdx + 1) / (steps.length - 1)) * 100;

                // segment is "completed" when the left step is completed (i.e., segIdx+1 < clamped)
                const isSegmentActive = segIdx + 1 < clamped;

                return (
                  <div
                    key={segIdx}
                    className="absolute z-0"
                    style={{
                      // place the segment at circle center height
                      top: CIRCLE / 2, // 20px
                      left: `calc(${leftPercent}% + ${CIRCLE / 2 + GAP}px)`,
                      right: `calc(${100 - rightPercent}% + ${CIRCLE / 2 + GAP + 20}px)`,
                      height: 2,
                      borderRadius: 9999,
                      backgroundColor: isSegmentActive ? "#22C55E" : "#AEC7DB",
                    }}
                  />
                );
              })}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default StepIndicator;
