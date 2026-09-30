export type TicketStatus =
  | "open"
  | "in_progress"
  | "resolved"
  | "closed";

export type TicketPriority = "P0" | "P1" | "P2" | "P3" | "P5";

export type TriageDecision =
  | "auto_accept"
  | "manual_review"
  | string;

export interface Ticket {
  id: string;
  external_id: string;

  customer_id: string;
  customer_plan: "basic" | "pro" | "enterprise" | "platinum";

  subject: string;
  body: string | null;
  attachment_url: string | null;

  created_at: string;

  status: TicketStatus;
  assigned_to: string | null;

  category: string;
  priority: TicketPriority;

  summary: string | null;
  triage_decision: TriageDecision;
  review_reason: string | null;
}

export interface Agent {
  id: string;
  name: string;
}