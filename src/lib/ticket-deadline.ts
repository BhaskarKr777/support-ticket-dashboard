import type { TicketPriority } from "@/types/ticket";

const SLA_HOURS: Record<
  TicketPriority,
  number
> = {
  P0: 1,
  P1: 4,
  P2: 24,
  P3: 72,
  P5: 72,
};

export function getDeadline(
  createdAt: string,
  priority: TicketPriority,
): Date {
  const createdTime = new Date(createdAt).getTime();

  return new Date(
    createdTime +
      SLA_HOURS[priority] * 60 * 60 * 1000,
  );
}

export type DeadlineState =
  | "late"
  | "at_risk"
  | "on_track";

export function getDeadlineState(
  createdAt: string,
  priority: TicketPriority,
  now = Date.now(),
): DeadlineState {
  const createdTime = new Date(
    createdAt,
  ).getTime();

  const deadline = getDeadline(
    createdAt,
    priority,
  ).getTime();

  const totalTime =
    deadline - createdTime;

  const remainingTime =
    deadline - now;

  if (remainingTime <= 0) {
    return "late";
  }

  if (
    remainingTime / totalTime <
    0.2
  ) {
    return "at_risk";
  }

  return "on_track";
}

export function formatRemainingTime(
  createdAt: string,
  priority: TicketPriority,
  now = Date.now(),
): string {
  const deadline = getDeadline(
    createdAt,
    priority,
  ).getTime();

  const remaining =
    deadline - now;

  if (remaining <= 0) {
    const overdueSeconds = Math.floor(
      Math.abs(remaining) / 1000,
    );

    const hours = Math.floor(
      overdueSeconds / 3600,
    );

    const minutes = Math.floor(
      (overdueSeconds % 3600) / 60,
    );

    const seconds =
      overdueSeconds % 60;

    return `-${String(hours).padStart(
      2,
      "0",
    )}:${String(minutes).padStart(
      2,
      "0",
    )}:${String(seconds).padStart(
      2,
      "0",
    )}`;
  }

  const totalSeconds = Math.floor(
    remaining / 1000,
  );

  const hours = Math.floor(
    totalSeconds / 3600,
  );

  const minutes = Math.floor(
    (totalSeconds % 3600) / 60,
  );

  const seconds =
    totalSeconds % 60;

  return `${String(hours).padStart(
    2,
    "0",
  )}:${String(minutes).padStart(
    2,
    "0",
  )}:${String(seconds).padStart(
    2,
    "0",
  )}`;
}