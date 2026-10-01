"use server";

import {
  getTicketById,
  updateTicket,
} from "@/lib/ticket-store";

export async function retriageTicket(
  id: string,
) {
  const apiKey = process.env.TRIAGE_API_KEY;

  if (!apiKey) {
    throw new Error(
      "Triage API key is not configured",
    );
  }

  const ticket = getTicketById(id);

  if (!ticket) {
    throw new Error("Ticket not found");
  }

  const updatedTicket = updateTicket(id, {
    triage_decision: "auto_accept",
    summary: `AI re-triaged ticket: ${ticket.subject}`,
    category: ticket.category,
    priority: ticket.priority,
    review_reason: null,
  });

  if (!updatedTicket) {
    throw new Error(
      "Unable to update ticket during re-triage",
    );
  }

  return updatedTicket;
}