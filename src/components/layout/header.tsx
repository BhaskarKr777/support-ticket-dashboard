
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
    <header className="sticky top-0 z-40 w-full bg-transparent px-3 py-2 sm:px-6 sm:py-3 lg:px-8 transition-all">
      <div className="mx-auto flex w-full max-w-[1536px] flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-2.5 shadow-sm shadow-slate-200/40 backdrop-blur-md sm:px-6 sm:py-3">
        {/* Brand */}
        <Link
          href="/tickets"
          className="group flex shrink-0 items-center gap-3 transition-transform active:scale-[0.98]"
          aria-label="Support Dashboard home"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-700 text-white shadow-sm shadow-indigo-500/20 transition-all group-hover:shadow-md group-hover:shadow-indigo-500/30 sm:h-10 sm:w-10">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-5 w-5 sm:h-5 sm:w-5"
              aria-hidden="true"
            >
              <path
                d="M4 13.5V11a8 8 0 0 1 16 0v2.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <rect
                x="3"
                y="12"
                width="4"
                height="6"
                rx="2"
                stroke="currentColor"
                strokeWidth="2"
              />
              <rect
                x="17"
                y="12"
                width="4"
                height="6"
                rx="2"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                d="M19 18a4 4 0 0 1-4 3h-3"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </span>

          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-tight text-slate-900 sm:text-base">
              Support Dashboard
            </span>
            <span className="hidden text-[11px] font-medium text-slate-500 sm:inline-block">
              Workspace & Agent Queue
            </span>
          </div>
        </Link>

        {/* Navigation */}
        <nav
          className="flex flex-wrap items-center gap-1.5 sm:gap-3"
          aria-label="Main navigation"
        >
          <Link
            href="/tickets"
            aria-current={
              pathname.startsWith("/tickets") ? "page" : undefined
            }
            className={`inline-flex min-h-9 items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all sm:min-h-10 sm:px-4 sm:py-2 sm:text-sm ${
              pathname.startsWith("/tickets")
                ? "bg-indigo-50 text-indigo-700 shadow-sm shadow-indigo-100/50"
                : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
            }`}
          >
            <span>My tickets</span>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-bold tabular-nums transition-colors ${
                pathname.startsWith("/tickets")
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {myTicketsCount.toLocaleString()}
            </span>
          </Link>

          <Link
            href="/review"
            aria-current={pathname === "/review" ? "page" : undefined}
            className={`inline-flex min-h-9 items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all sm:min-h-10 sm:px-4 sm:py-2 sm:text-sm ${
              pathname === "/review"
                ? "bg-indigo-50 text-indigo-700 shadow-sm shadow-indigo-100/50"
                : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
            }`}
          >
            <span>To review</span>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-bold tabular-nums transition-colors ${
                pathname === "/review"
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {reviewCount.toLocaleString()}
            </span>
          </Link>

          {/* Agent selector */}
          <div className="ml-1 flex items-center gap-2 border-l border-slate-200/80 pl-3 sm:ml-3 sm:pl-4">
            <span className="hidden text-xs font-medium text-slate-400 lg:inline-block">
              Agent:
            </span>
            <div className="relative flex items-center">
              <label htmlFor="current-agent" className="sr-only">
                Current agent
              </label>
              <select
                id="current-agent"
                value={selectedAgent.id}
                onChange={(event) => handleAgentChange(event.target.value)}
                className="h-9 cursor-pointer rounded-xl border border-slate-200/90 bg-slate-50/70 px-3 pr-8 text-xs font-bold text-slate-800 shadow-sm outline-none transition-all hover:border-slate-300 hover:bg-white focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 sm:h-10 sm:text-sm"
              >
                {agents.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}