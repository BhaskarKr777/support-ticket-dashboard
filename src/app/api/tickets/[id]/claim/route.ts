import { NextRequest, NextResponse } from "next/server";
import { getTicketById, updateTicket } from "@/lib/ticket-store";
import {
  apiError,
  simulateApiBehavior,
} from "@/lib/api-utils";

const validAgents = [
  "agent-1",
  "agent-2",
  "agent-3",
];

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(
  request: NextRequest,
  context: RouteContext,
) {
  try {
    await simulateApiBehavior();

    const { id } = await context.params;
    const ticket = getTicketById(id);

    if (!ticket) {
      return apiError("Ticket not found", 404);
    }

    const body = await request.json();
    const agentId = body.agent_id;

    if (!validAgents.includes(agentId)) {
      return apiError("Invalid agent", 400);
    }

    if (ticket.assigned_to) {
      return apiError(
        "Ticket is already claimed",
        409,
      );
    }

    if (Math.random() < 0.25) {
      return apiError(
        "Ticket claim failed",
        409,
      );
    }

    const updatedTicket = updateTicket(id, {
      assigned_to: agentId,
      status: "in_progress",
    });

    return NextResponse.json({
      ticket: updatedTicket,
    });
  } catch {
    return apiError(
      "Unable to claim ticket",
      500,
    );
  }
}