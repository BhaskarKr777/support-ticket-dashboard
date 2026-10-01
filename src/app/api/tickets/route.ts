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

    const { searchParams } =
      request.nextUrl;

    const page = Math.max(
      Number(
        searchParams.get("page") ?? "1",
      ),
      1,
    );

    const requestedLimit = Number(
      searchParams.get("limit") ?? "100",
    );

    const limit = Math.min(
      Math.max(
        Number.isFinite(requestedLimit)
          ? requestedLimit
          : 100,
        1,
      ),
      100,
    );

    const search = searchParams
      .get("search")
      ?.trim()
      .toLowerCase();

    const status =
      searchParams.get("status");

    const priority =
      searchParams.get("priority");

    const category =
      searchParams.get("category");

    const triageDecision =
      searchParams.get(
        "triage_decision",
      );

    let tickets = getTickets();

    /*
     * Server-side filters
     */

    if (status) {
      tickets = tickets.filter(
        (ticket) =>
          ticket.status === status,
      );
    }

    if (priority) {
      tickets = tickets.filter(
        (ticket) =>
          ticket.priority === priority,
      );
    }

    if (category) {
      tickets = tickets.filter(
        (ticket) =>
          ticket.category === category,
      );
    }

    if (triageDecision) {
      tickets = tickets.filter(
        (ticket) =>
          ticket.triage_decision ===
          triageDecision,
      );
    }

    /*
     * Search subject, body,
     * external ID and customer ID.
     */

    if (search) {
      tickets = tickets.filter(
        (ticket) => {
          return (
            ticket.subject
              .toLowerCase()
              .includes(search) ||
            (ticket.body
              ?.toLowerCase()
              .includes(search) ??
              false) ||
            ticket.external_id
              .toLowerCase()
              .includes(search) ||
            ticket.customer_id
              .toLowerCase()
              .includes(search)
          );
        },
      );
    }

    /*
     * Pagination
     *
     * The API never returns more
     * than 100 tickets per request.
     */

    const total = tickets.length;

    const totalPages =
      Math.ceil(total / limit);

    const safePage = Math.min(
      page,
      Math.max(totalPages, 1),
    );

    const start =
      (safePage - 1) * limit;

    const end = start + limit;

    const paginatedTickets =
      tickets.slice(start, end);

    return NextResponse.json({
      tickets: paginatedTickets,
      total,
      page: safePage,
      limit,
      totalPages,
    });
  } catch {
    return apiError(
      "Unable to fetch tickets",
      500,
    );
  }
}