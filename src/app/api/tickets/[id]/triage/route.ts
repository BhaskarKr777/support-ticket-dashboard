
import { NextRequest, NextResponse } from "next/server";
import { getTicketById, updateTicket } from "@/lib/ticket-store";
import { apiError, simulateApiBehavior } from "@/lib/api-utils";

const validPriorities = ["P0", "P1", "P2", "P3"];

interface RouteContext {
  params: Promise<{ id: string }>;
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
    const { action, category, priority, review_reason } = body;

    if (action !== "accept" && action !== "edit") {
      return apiError("Action must be accept or edit", 400);
    }

    if (action === "edit") {
      if (typeof review_reason !== "string" || review_reason.trim().length < 10) {
        return apiError(
          "A reason of at least 10 characters is required",
          400,
        );
      }

      if (category !== undefined &&
          (typeof category !== "string" || !category.trim())) {
        return apiError("Category must be a non-empty string", 400);
      }

      if (priority !== undefined &&
          !validPriorities.includes(priority)) {
        return apiError("Invalid priority", 400);
      }

      if (
        ticket.customer_plan === "enterprise" &&
        priority !== undefined &&
        !["P0", "P1"].includes(priority)
      ) {
        return apiError(
          "Enterprise tickets must have priority P0 or P1",
          409,
        );
      }

      if (category === undefined && priority === undefined) {
        return apiError(
          "Provide a category or priority change",
          400,
        );
      }
    }

    const updatedTicket = updateTicket(id, {
      triage_decision: "auto_accept",
      ...(action === "edit" && {
        ...(category !== undefined && { category: category.trim() }),
        ...(priority !== undefined && { priority }),
        review_reason: review_reason.trim(),
      }),
      ...(action === "accept" && {
        review_reason: "AI recommendation reviewed and accepted.",
      }),
    });

    if (!updatedTicket) {
      return apiError("Unable to update ticket", 500);
    }

    return NextResponse.json({ ticket: updatedTicket });
  } catch {
    return apiError("Unable to update ticket triage", 500);
  }
}