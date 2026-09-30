import testTickets from "@/data/test-tickets.json";
import { generateTickets } from "@/data/generate-tickets";
import type { Ticket } from "@/types/ticket";

interface TicketUpdate {
  ticket_id: string;
  type: "created" | "updated";
  updated_at: string;
}

const generatedTickets = generateTickets(5000);
const ticketUpdates: TicketUpdate[] = [];

const tickets: Ticket[] = [
  ...(testTickets as Ticket[]).map((ticket, index) => ({
    ...ticket,
    id: `test-${index + 1}`,
  })),

  ...generatedTickets,
];

export function getTickets(): Ticket[] {
  return tickets;
}

export function getTicketById(id: string): Ticket | undefined {
  return tickets.find((ticket) => ticket.id === id);
}

export function updateTicket(
  id: string,
  updates: Partial<Ticket>,
): Ticket | undefined {
  const ticket = getTicketById(id);

  if (!ticket) {
    return undefined;
  }

  Object.assign(ticket, updates);

  ticketUpdates.push({
    ticket_id: id,
    type: "updated",
    updated_at: new Date().toISOString(),
  });

  return ticket;
}

export function addTicket(ticket: Ticket): Ticket {
  tickets.push(ticket);

  ticketUpdates.push({
    ticket_id: ticket.id,
    type: "created",
    updated_at: new Date().toISOString(),
  });

  return ticket;
}

export function getUpdatesSince(
  since: string,
): TicketUpdate[] {
  const sinceTime = new Date(since).getTime();

  return ticketUpdates.filter(
    (update) =>
      new Date(update.updated_at).getTime() > sinceTime,
  );
}

function simulateLiveUpdate() {
  const action = Math.floor(Math.random() * 3);

  if (action === 0) {
    const newTicket: Ticket = {
      id: `live-${Date.now()}`,
      external_id: `LIVE-${Date.now()}`,
      customer_id: `C-LIVE-${Date.now()}`,
      customer_plan: "pro",
      subject: "New simulated support ticket",
      body: "This ticket was created by the live update simulator.",
      attachment_url: null,
      created_at: new Date().toISOString(),
      status: "open",
      assigned_to: null,
      category: "general",
      priority: "P2",
      summary: "Simulated live ticket.",
      triage_decision: "auto_accept",
      review_reason: null,
    };

    addTicket(newTicket);
    return;
  }

  const availableTickets = tickets.filter(
    (ticket) => ticket.status === "open",
  );

  if (availableTickets.length === 0) {
    return;
  }

  const ticket =
    availableTickets[
      Math.floor(Math.random() * availableTickets.length)
    ];

  if (action === 1) {
    updateTicket(ticket.id, {
      assigned_to: "agent-2",
      status: "in_progress",
    });
    return;
  }

  updateTicket(ticket.id, {
    status: "resolved",
  });
}

function scheduleNextLiveUpdate() {
  const delay =
    Math.floor(Math.random() * (10000 - 5000 + 1)) + 5000;

  setTimeout(() => {
    simulateLiveUpdate();
    scheduleNextLiveUpdate();
  }, delay);
}

scheduleNextLiveUpdate();