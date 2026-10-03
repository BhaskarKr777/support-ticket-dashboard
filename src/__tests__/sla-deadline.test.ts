import { describe, expect, it } from "vitest";
import {
  getDeadline,
  getDeadlineState,
  formatRemainingTime,
} from "../lib/ticket-deadline";

describe("SLA Deadline Calculations", () => {
  const baseTime = "2026-10-03T12:00:00.000Z";
  const baseMs = new Date(baseTime).getTime();

  it("calculates exact SLA hours based on priority", () => {
    expect(getDeadline(baseTime, "P0").getTime()).toBe(baseMs + 1 * 3600 * 1000);
    expect(getDeadline(baseTime, "P1").getTime()).toBe(baseMs + 4 * 3600 * 1000);
    expect(getDeadline(baseTime, "P2").getTime()).toBe(baseMs + 24 * 3600 * 1000);
    expect(getDeadline(baseTime, "P3").getTime()).toBe(baseMs + 72 * 3600 * 1000);
  });

  it("identifies deadline status correctly (on_track, at_risk, late)", () => {
    const halfTime = baseMs + 0.5 * 3600 * 1000;
    expect(getDeadlineState(baseTime, "P0", halfTime)).toBe("on_track");

    const atRiskTime = baseMs + 0.9 * 3600 * 1000;
    expect(getDeadlineState(baseTime, "P0", atRiskTime)).toBe("at_risk");

    const pastTime = baseMs + 1.1 * 3600 * 1000;
    expect(getDeadlineState(baseTime, "P0", pastTime)).toBe("late");
  });

  it("formats remaining and overdue time strings properly", () => {
    const remainingTime = baseMs + 30 * 60 * 1000;
    expect(formatRemainingTime(baseTime, "P0", remainingTime)).toBe("00:30:00");

    const overdueTime = baseMs + 75 * 60 * 1000;
    expect(formatRemainingTime(baseTime, "P0", overdueTime)).toBe("-00:15:00");
  });
});
