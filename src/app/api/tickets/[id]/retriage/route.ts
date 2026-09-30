import { NextRequest, NextResponse } from "next/server";
import { getTicketById, updateTicket } from "@/lib/ticket-store";
import {
  apiError,
  simulateApiBehavior,
} from "@/lib/api-utils";

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
    const apiKey = request.headers.get("x-triage-api-key");
    const expectedApiKey = process.env.TRIAGE_API_KEY;

    if (!expectedApiKey) {
      return apiError(
        "Triage API key is not configured",
        500,
      );
    }

    if (apiKey !== expectedApiKey) {
      return apiError("Unauthorized", 401);
    }

    await simulateApiBehavior();

    const { id } = await context.params;

    const ticket = getTicketById(id);

    if (!ticket) {
      return apiError("Ticket not found", 404);
    }

    const updatedTicket = updateTicket(id, {
      triage_decision: "auto_accept",
      summary: `AI re-triaged ticket: ${ticket.subject}`,
      category: ticket.category,
      priority: ticket.priority,
      review_reason: null,
    });

    return NextResponse.json({
      ticket: updatedTicket,
    });
  } catch {
    return apiError(
      "Unable to re-triage ticket",
      500,
    );
  }
}