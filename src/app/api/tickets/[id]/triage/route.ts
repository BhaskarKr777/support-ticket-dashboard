import { NextRequest, NextResponse } from "next/server";
import { getTicketById, updateTicket } from "@/lib/ticket-store";
import {
  apiError,
  simulateApiBehavior,
} from "@/lib/api-utils";

const validPriorities = ["P0", "P1", "P2", "P3"];

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

    const { category, priority, review_reason } = body;

    if (priority && !validPriorities.includes(priority)) {
      return apiError("Invalid priority", 400);
    }

    if (
      ticket.customer_plan === "enterprise" &&
      priority &&
      !["P0", "P1"].includes(priority)
    ) {
      return apiError(
        "Enterprise tickets must have priority P0 or P1",
        409,
      );
    }

    if (
      review_reason !== undefined &&
      review_reason !== null &&
      typeof review_reason !== "string"
    ) {
      return apiError("Invalid review reason", 400);
    }

    const updatedTicket = updateTicket(id, {
      ...(category !== undefined && { category }),
      ...(priority !== undefined && { priority }),
      ...(review_reason !== undefined && {
        review_reason,
      }),
    });

    return NextResponse.json({
      ticket: updatedTicket,
    });
  } catch {
    return apiError(
      "Unable to update ticket triage",
      500,
    );
  }
}