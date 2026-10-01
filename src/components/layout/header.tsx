"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import type {
  AppDispatch,
  RootState,
} from "@/store/store";

import {
  setCurrentAgent,
  saveAgent,
} from "@/store/agentSlice";

export function Header() {
  const dispatch =
    useDispatch<AppDispatch>();

  const currentAgentId = useSelector(
    (state: RootState) =>
      state.agent.currentAgentId,
  );

  const agents = useSelector(
    (state: RootState) =>
      state.agent.agents,
  );

  const [myTicketsCount, setMyTicketsCount] =
    useState(0);

  const [reviewCount, setReviewCount] =
    useState(0);

  useEffect(() => {
    async function loadStats() {
      try {
        const response = await fetch(
          `/api/tickets/stats?agent_id=${currentAgentId}`,
        );

        if (!response.ok) {
          throw new Error(
            "Failed to load stats",
          );
        }

        const data =
          await response.json();

        setMyTicketsCount(
          data.myTickets,
        );

        setReviewCount(
          data.toReview,
        );
      } catch {
        // Keep the previous counts if
        // the simulated API request fails.
      }
    }

    loadStats();
  }, [currentAgentId]);

  function handleAgentChange(
    event: React.ChangeEvent<HTMLSelectElement>,
  ) {
    const agentId =
      event.target.value;

    dispatch(
      setCurrentAgent(agentId),
    );

    saveAgent(agentId);
  }

  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex min-h-16 w-full max-w-[1600px] items-center justify-between gap-4 px-4">
        <Link
          href="/tickets"
          className="font-semibold"
        >
          Support Dashboard
        </Link>

        <nav className="flex items-center gap-4">
          <Link
            href="/tickets"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            My tickets ({myTicketsCount})
          </Link>

          <Link
            href="/review"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            To review ({reviewCount})
          </Link>

          <select
            value={currentAgentId}
            onChange={handleAgentChange}
            className="h-9 rounded-md border px-3 text-sm"
          >
            {agents.map((agent) => (
              <option
                key={agent.id}
                value={agent.id}
              >
                {agent.name}
              </option>
            ))}
          </select>
        </nav>
      </div>
    </header>
  );
}