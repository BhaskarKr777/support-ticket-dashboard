import { NextResponse } from "next/server";

export async function simulateApiDelay(): Promise<void> {
  const delay = Math.floor(
    Math.random() * (1500 - 300 + 1) + 300,
  );

  await new Promise((resolve) => setTimeout(resolve, delay));
}

export function shouldSimulateFailure(): boolean {
  return Math.random() < 0.1;
}

export async function simulateApiBehavior(): Promise<void> {
  await simulateApiDelay();

  if (shouldSimulateFailure()) {
    throw new Error("Simulated API failure");
  }
}

export function apiError(
  message: string,
  status: number,
) {
  return NextResponse.json(
    {
      error: message,
    },
    { status },
  );
}