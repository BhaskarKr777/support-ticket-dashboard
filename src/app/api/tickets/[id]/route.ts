import { NextRequest, NextResponse } from "next/server";
import { getTicketById } from "@/lib/ticket-store";
import {
  apiError,
  simulateApiBehavior,
} from "@/lib/api-utils";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(
  _request: NextRequest,
  context: RouteContext,
) {
  try {
    await simulateApiBehavior();

    const { id } = await context.params;

    const ticket = getTicketById(id);

    if (!ticket) {
      return apiError("Ticket not found", 404);
    }

    return NextResponse.json({
      ticket,
    });
  } catch {
    return apiError("Unable to fetch ticket", 500);
  }
}