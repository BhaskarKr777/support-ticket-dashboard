import testTickets from "@/data/test-tickets.json";
import { generateTickets } from "@/data/generate-tickets";
import type { Ticket } from "@/types/ticket";

const generatedTickets = generateTickets(5000);

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

  return ticket;
}

export function addTicket(ticket: Ticket): Ticket {
  tickets.push(ticket);

  return ticket;
}