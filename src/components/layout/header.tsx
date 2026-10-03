
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import type { AppDispatch, RootState } from "@/store/store";
import { setCurrentAgent } from "@/store/agentSlice";

const agents = [
  { id: "agent-1", name: "Priya" },
  { id: "agent-2", name: "Rahul" },
  { id: "agent-3", name: "Meera" },
];

type TicketStats = {
  myTickets: number;
  toReview: number;
};

export function Header() {
  const dispatch = useDispatch<AppDispatch>();
  const pathname = usePathname();

  const currentAgentId = useSelector(
    (state: RootState) => state.agent.currentAgentId,
  );

  const [myTicketsCount, setMyTicketsCount] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadStats() {
      try {
        const response = await fetch(
          `/api/tickets/stats?agent_id=${encodeURIComponent(currentAgentId)}`,
          {
            cache: "no-store",
            signal: controller.signal,
          },
        );

        if (!response.ok) return;

        const data: TicketStats = await response.json();

        setMyTicketsCount(data.myTickets ?? 0);
        setReviewCount(data.toReview ?? 0);
      } catch (error) {
        if (error instanceof Error && error.name !== "AbortError") {
          console.error("Failed to load ticket statistics:", error);
        }
      }
    }

    loadStats();

    return () => {
      controller.abort();
    };
  }, [currentAgentId, pathname]);

  const selectedAgent =
    agents.find((agent) => agent.id === currentAgentId) ?? agents[0];

  function handleAgentChange(agentId: string) {
    dispatch(setCurrentAgent(agentId));
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#dfe3ed] bg-[#fffefa]">
      <div className="mx-auto flex min-h-[60px] w-full max-w-[1600px] flex-wrap items-center justify-between gap-2 px-3 py-2 sm:min-h-[68px] sm:gap-3 sm:px-6 sm:py-0 lg:px-10">
        {/* Brand */}
        <Link
          href="/tickets"
          className="flex shrink-0 items-center gap-2.5"
          aria-label="Support Dashboard home"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#e6e9f8] text-[#6569a9] sm:h-9 sm:w-9">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-4 w-4 sm:h-5 sm:w-5"
              aria-hidden="true"
            >
              <path
                d="M4 13.5V11a8 8 0 0 1 16 0v2.5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              <rect
                x="3"
                y="12"
                width="4"
                height="6"
                rx="2"
                stroke="currentColor"
                strokeWidth="1.8"
              />
              <rect
                x="17"
                y="12"
                width="4"
                height="6"
                rx="2"
                stroke="currentColor"
                strokeWidth="1.8"
              />
              <path
                d="M19 18a4 4 0 0 1-4 3h-3"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </span>

          <span className="text-xs font-bold tracking-tight text-[#202943] min-[360px]:text-sm sm:text-[15px]">
            Support Dashboard
          </span>
        </Link>

        {/* Navigation */}
        <nav
          className="flex flex-wrap items-center gap-1 sm:gap-3"
          aria-label="Main navigation"
        >
          <Link
            href="/tickets"
            aria-current={
              pathname.startsWith("/tickets") ? "page" : undefined
            }
            className={`inline-flex min-h-9 items-center gap-1.5 rounded-xl px-2 py-1.5 text-xs font-medium transition-colors sm:min-h-10 sm:gap-2 sm:px-3 sm:py-2 sm:text-sm ${pathname.startsWith("/tickets")
                ? "bg-[#e9eaf8] text-[#555b9b]"
                : "text-[#65708a] hover:bg-[#f1f2f8]"
              }`}
          >
            <span>My tickets</span>
            <span className="rounded-full bg-white px-1.5 py-0.5 text-xs font-semibold tabular-nums text-[#555b9b] sm:px-2">
              {myTicketsCount.toLocaleString()}
            </span>
          </Link>

          <Link
            href="/review"
            aria-current={pathname === "/review" ? "page" : undefined}
            className={`inline-flex min-h-9 items-center gap-1.5 rounded-xl px-2 py-1.5 text-xs font-medium transition-colors sm:min-h-10 sm:gap-2 sm:px-3 sm:py-2 sm:text-sm ${pathname === "/review"
                ? "bg-[#e9eaf8] text-[#555b9b]"
                : "text-[#65708a] hover:bg-[#f1f2f8]"
              }`}
          >
            <span>To review</span>
            <span className="rounded-full bg-[#f0f2f7] px-1.5 py-0.5 text-xs font-semibold tabular-nums text-[#77829a] sm:px-2">
              {reviewCount.toLocaleString()}
            </span>
          </Link>

          {/* Agent selector */}
          <div className="ml-0.5 border-l border-[#e3e6ef] pl-1.5 sm:ml-2 sm:pl-4">
            <label htmlFor="current-agent" className="sr-only">
              Current agent
            </label>

            <select
              id="current-agent"
              value={selectedAgent.id}
              onChange={(event) =>
                handleAgentChange(event.target.value)
              }
              className="h-9 min-w-[76px] rounded-xl border border-[#dce1ed] bg-white px-1.5 text-xs font-semibold text-[#35415f] outline-none transition-colors hover:border-[#b9c2df] focus-visible:ring-2 focus-visible:ring-[#a6acd9] sm:h-10 sm:min-w-[120px] sm:px-3 sm:text-sm"
            >
              {agents.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.name}
                </option>
              ))}
            </select>
          </div>
        </nav>
      </div>
    </header>
  );
}