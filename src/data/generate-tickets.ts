import type { Ticket } from "@/types/ticket";

const agents = ["agent-1", "agent-2", "agent-3"] as const;

const plans = [
  "basic",
  "pro",
  "enterprise",
  "platinum",
] as const;

const categories = [
  "billing",
  "technical",
  "account_access",
  "shipping",
  "general",
] as const;

const priorities = ["P0", "P1", "P2", "P3"] as const;

const statuses = ["open", "in_progress", "resolved"] as const;

export function generateTickets(count: number): Ticket[] {
  return Array.from({ length: count }, (_, index) => {
    const priority = priorities[index % priorities.length];
    const status = statuses[index % statuses.length];

    return {
      id: `generated-${index + 1}`,
      external_id: `GEN-${String(index + 1).padStart(5, "0")}`,

      customer_id: `C-GEN-${index + 1}`,
      customer_plan: plans[index % plans.length],

      subject: `Support ticket ${index + 1}`,
      body: `This is generated ticket ${index + 1}.`,
      attachment_url: null,

      created_at: new Date(
        Date.now() - index * 60 * 60 * 1000,
      ).toISOString(),

      status,
      assigned_to:
        status === "open"
          ? null
          : agents[index % agents.length],

      category: categories[index % categories.length],
      priority,

      summary: `Generated summary for ticket ${index + 1}.`,

      triage_decision:
        index % 5 === 0
          ? "manual_review"
          : "auto_accept",

      review_reason: null,
    };
  });
}