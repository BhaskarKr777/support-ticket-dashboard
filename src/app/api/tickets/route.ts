import { NextRequest, NextResponse } from "next/server";
import { getTickets } from "@/lib/ticket-store";
import {
  apiError,
  simulateApiBehavior,
} from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  try {
    await simulateApiBehavior();

    const { searchParams } = request.nextUrl;

    const page = Math.max(
      Number(searchParams.get("page")) || 1,
      1,
    );

    const limit = Math.max(
      Number(searchParams.get("limit")) || 50,
      1,
    );

    const search = searchParams
      .get("search")
      ?.trim()
      .toLowerCase();

    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const category = searchParams.get("category");
    const triageDecision = searchParams.get("triage_decision");

    let tickets = getTickets();

    if (status) {
      tickets = tickets.filter(
        (ticket) => ticket.status === status,
      );
    }

    if (priority) {
      tickets = tickets.filter(
        (ticket) => ticket.priority === priority,
      );
    }

    if (category) {
      tickets = tickets.filter(
        (ticket) => ticket.category === category,
      );
    }

    if (triageDecision) {
      tickets = tickets.filter(
        (ticket) =>
          ticket.triage_decision === triageDecision,
      );
    }

    if (search) {
      tickets = tickets.filter((ticket) => {
        return (
          ticket.subject.toLowerCase().includes(search) ||
          ticket.external_id
            .toLowerCase()
            .includes(search) ||
          ticket.customer_id
            .toLowerCase()
            .includes(search)
        );
      });
    }

    const total = tickets.length;

    const start = (page - 1) * limit;
    const end = start + limit;

    const paginatedTickets = tickets.slice(start, end);

    return NextResponse.json({
      tickets: paginatedTickets,
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit),
      },
    });
  } catch {
    return apiError(
      "Unable to fetch tickets",
      500,
    );
  }
}