import { NextRequest, NextResponse } from "next/server";
import { getUpdatesSince } from "@/lib/ticket-store";
import {
  apiError,
  simulateApiBehavior,
} from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  try {
    await simulateApiBehavior();

    const since = request.nextUrl.searchParams.get("since");

    if (!since) {
      return apiError(
        "The since parameter is required",
        400,
      );
    }

    const sinceTime = new Date(since).getTime();

    if (Number.isNaN(sinceTime)) {
      return apiError(
        "Invalid since timestamp",
        400,
      );
    }

    const updates = getUpdatesSince(since);

    return NextResponse.json({
      updates,
    });
  } catch {
    return apiError(
      "Unable to fetch ticket updates",
      500,
    );
  }
}