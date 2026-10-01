import { NextRequest, NextResponse } from "next/server";

import { getTickets } from "@/lib/ticket-store";
import {
  apiError,
  simulateApiBehavior,
} from "@/lib/api-utils";

export async function GET(
  request: NextRequest,
) {
  try {
    await simulateApiBehavior();

    const agentId =
      request.nextUrl.searchParams.get(
        "agent_id",
      );

    const tickets = getTickets();

    const myTickets = agentId
      ? tickets.filter(
          (ticket) =>
            ticket.assigned_to ===
            agentId,
        ).length
      : 0;

    const toReview = tickets.filter(
      (ticket) =>
        ticket.triage_decision ===
        "manual_review",
    ).length;

    return NextResponse.json({
      myTickets,
      toReview,
    });
  } catch {
    return apiError(
      "Unable to fetch ticket statistics",
      500,
    );
  }
}