"use client";

import { useEffect, useState } from "react";

function diff(target: number) {
  const ms = Math.max(0, target - Date.now());
  return {
    days: Math.floor(ms / 86_400_000),
    hours: Math.floor((ms / 3_600_000) % 24),
    minutes: Math.floor((ms / 60_000) % 60),
    seconds: Math.floor((ms / 1000) % 60),
    done: ms === 0,
  };
}

export default function PowerDealCountdown({ targetDate }: { targetDate: string }) {
  const target = new Date(targetDate).getTime();
  // Start null so the server render and first client render match.
  const [left, setLeft] = useState<ReturnType<typeof diff> | null>(null);

  useEffect(() => {
    if (Number.isNaN(target)) return;
    setLeft(diff(target));
    const t = setInterval(() => setLeft(diff(target)), 1000);
    return () => clearInterval(t);
  }, [target]);

  if (Number.isNaN(target) || left?.done) return null;

  const units: Array<[string, number | undefined]> = [
    ["Days", left?.days],
    ["Hrs", left?.hours],
    ["Min", left?.minutes],
    ["Sec", left?.seconds],
  ];

  return (
    <div className="flex gap-2" role="timer" aria-label="Deal ends in">
      {units.map(([label, value]) => (
        <div
          key={label}
          className="min-w-14 rounded-xl bg-white/15 px-3 py-2 text-center backdrop-blur"
        >
          <div className="text-h3 font-bold tabular-nums">
            {value === undefined ? "--" : String(value).padStart(2, "0")}
          </div>
          <div className="text-caption uppercase tracking-wider text-white/80 font-medium">
            {label}
          </div>
        </div>
      ))}
    </div>
  );
}
