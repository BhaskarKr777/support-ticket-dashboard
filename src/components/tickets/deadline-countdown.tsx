
"use client";

import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";

type DeadlineCountdownProps = {
  createdAt: string;
  priority: string;
};

const SLA_HOURS: Record<string, number> = {
  P0: 1,
  P1: 4,
  P2: 24,
  P3: 72,
};

export function DeadlineCountdown({
  createdAt,
  priority,
}: DeadlineCountdownProps) {
  const now = useSelector((state: RootState) => state.time.now);

  const createdTime = new Date(createdAt).getTime();
  const slaHours = SLA_HOURS[priority];

  if (!Number.isFinite(createdTime) || slaHours === undefined) {
    return (
      <span className="text-xs text-muted-foreground">
        SLA unavailable
      </span>
    );
  }

  const deadline = createdTime + slaHours * 60 * 60 * 1000;
  const remaining = deadline - now;

  if (remaining <= 0) {
    const overdueHours = Math.floor(
      Math.abs(remaining) / (60 * 60 * 1000),
    );

    return (
      <div className="flex flex-col gap-1">
        <span className="inline-flex w-fit items-center rounded-full bg-red-50 px-2 py-1 text-xs font-semibold text-red-700">
          Overdue
        </span>

        <span className="text-xs text-muted-foreground">
          {overdueHours < 1
            ? "Less than 1 hour overdue"
            : `${overdueHours}h overdue`}
        </span>
      </div>
    );
  }

  const totalSeconds = Math.floor(remaining / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return (
    <div className="flex flex-col gap-1">
      <span
        className={`font-mono text-sm font-semibold tabular-nums ${
          hours < 1 ? "text-amber-700" : "text-gray-900"
        }`}
      >
        {String(hours).padStart(2, "0")}:
        {String(minutes).padStart(2, "0")}:
        {String(seconds).padStart(2, "0")}
      </span>

      <span className="text-xs text-muted-foreground">
        {hours < 1 ? "Due soon" : "Time remaining"}
      </span>
    </div>
  );
}