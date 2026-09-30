import { NextRequest, NextResponse } from "next/server";
import { getTicketById, updateTicket } from "@/lib/ticket-store";
import {
  apiError,
  simulateApiBehavior,
} from "@/lib/api-utils";

const allowedTransitions: Record<string, string[]> = {
  open: ["in_progress"],
  in_progress: ["resolved"],
  resolved: ["open"],
};

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function PATCH(
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
    const newStatus = body.status;

    if (
      !["open", "in_progress", "resolved"].includes(newStatus)
    ) {
      return apiError("Invalid status", 400);
    }

    const allowedNextStatuses =
      allowedTransitions[ticket.status] ?? [];

    if (!allowedNextStatuses.includes(newStatus)) {
      return apiError(
        `Cannot change status from ${ticket.status} to ${newStatus}`,
        409,
      );
    }

    const updatedTicket = updateTicket(id, {
      status: newStatus,
    });

    return NextResponse.json({
      ticket: updatedTicket,
    });
  } catch {
    return apiError(
      "Unable to update ticket status",
      500,
    );
  }
}