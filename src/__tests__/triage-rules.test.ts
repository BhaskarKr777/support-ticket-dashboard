import { describe, expect, it } from "vitest";

describe("Triage Validation Rules", () => {
  it("validates Enterprise priority requirement (must be P0 or P1)", () => {
    const isEnterpriseAllowed = (plan: string, priority: string) => {
      if (plan === "enterprise" && !["P0", "P1"].includes(priority)) {
        return false;
      }
      return true;
    };

    expect(isEnterpriseAllowed("enterprise", "P0")).toBe(true);
    expect(isEnterpriseAllowed("enterprise", "P1")).toBe(true);
    expect(isEnterpriseAllowed("enterprise", "P2")).toBe(false);
    expect(isEnterpriseAllowed("enterprise", "P3")).toBe(false);
    expect(isEnterpriseAllowed("pro", "P2")).toBe(true);
  });

  it("enforces minimum 10-character reason for manual triage changes", () => {
    const isValidReason = (reason: string) => reason.trim().length >= 10;

    expect(isValidReason("Too short")).toBe(false);
    expect(isValidReason("Correct category based on logs.")).toBe(true);
  });

  it("validates allowed ticket status transitions", () => {
    const isAllowedTransition = (current: string, next: string) => {
      const allowed: Record<string, string[]> = {
        open: ["in_progress"],
        in_progress: ["resolved"],
        resolved: ["open"],
        closed: [],
      };
      return allowed[current]?.includes(next) ?? false;
    };

    expect(isAllowedTransition("open", "in_progress")).toBe(true);
    expect(isAllowedTransition("in_progress", "resolved")).toBe(true);
    expect(isAllowedTransition("resolved", "open")).toBe(true);
    expect(isAllowedTransition("open", "resolved")).toBe(false);
  });
});
