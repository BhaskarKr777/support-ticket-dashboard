import { NextRequest, NextResponse } from "next/server";

import { apiError } from "@/lib/api-utils";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(
  _request: NextRequest,
  context: RouteContext,
) {
  try {
    const { id } = await context.params;

    const apiKey = process.env.TRIAGE_API_KEY;

    if (!apiKey) {
      return apiError(
        "Triage API key is not configured",
        500,
      );
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      "http://localhost:3000";

    const response = await fetch(
      `${baseUrl}/api/tickets/${id}/retriage`,
      {
        method: "POST",
        headers: {
          "x-triage-api-key": apiKey,
        },
        cache: "no-store",
      },
    );

    const data = await response.json();

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch {
    return apiError(
      "Unable to re-triage ticket",
      500,
    );
  }
}