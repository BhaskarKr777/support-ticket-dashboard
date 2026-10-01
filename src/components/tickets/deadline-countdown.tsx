"use client";

import { useSelector } from "react-redux";

import type { RootState } from "@/store/store";

import type { TicketPriority } from "@/types/ticket";

import {
  formatRemainingTime,
  getDeadlineState,
} from "@/lib/ticket-deadline";

interface DeadlineCountdownProps {
  createdAt: string;
  priority: TicketPriority;
}

export function DeadlineCountdown({
  createdAt,
  priority,
}: DeadlineCountdownProps) {
  const now = useSelector(
    (state: RootState) =>
      state.time.now,
  );

  const deadlineState =
    getDeadlineState(
      createdAt,
      priority,
      now,
    );

  const remaining =
    formatRemainingTime(
      createdAt,
      priority,
      now,
    );

  const stateLabel =
    deadlineState === "late"
      ? "Late"
      : deadlineState === "at_risk"
        ? "At risk"
        : "On track";

  return (
    <div className="min-w-[110px]">
      <div className="font-mono text-sm font-medium">
        {remaining}
      </div>

      <div className="text-xs text-muted-foreground">
        {stateLabel}
      </div>
    </div>
  );
}