"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import type {
  RootState,
  AppDispatch,
} from "@/store/store";

import {
  loadSavedAgent,
  saveAgent,
  setCurrentAgent,
} from "@/store/agentSlice";

import { fetchTickets } from "@/store/ticketSlice";

export function Header() {
  const dispatch = useDispatch<AppDispatch>();

  const agents = useSelector(
    (state: RootState) => state.agent.agents,
  );

  const currentAgentId = useSelector(
    (state: RootState) =>
      state.agent.currentAgentId,
  );

  const tickets = useSelector(
    (state: RootState) =>
      state.tickets.tickets,
  );

  const myTicketsCount = tickets.filter(
    (ticket) =>
      ticket.assigned_to === currentAgentId,
  ).length;

  const reviewCount = tickets.filter(
    (ticket) =>
      ticket.triage_decision === "manual_review",
  ).length;

  useEffect(() => {
    const savedAgent = loadSavedAgent();

    if (
      savedAgent &&
      agents.some(
        (agent) => agent.id === savedAgent,
      )
    ) {
      dispatch(setCurrentAgent(savedAgent));
    }

    dispatch(fetchTickets());
  }, [agents, dispatch]);

  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <div>
          <h1 className="text-lg font-semibold">
            Support Dashboard
          </h1>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-sm">
            My tickets ({myTicketsCount})
          </div>

          <div className="text-sm">
            To review ({reviewCount})
          </div>

          <select
            value={currentAgentId}
            onChange={(event) => {
              const agentId =
                event.target.value;

              dispatch(
                setCurrentAgent(agentId),
              );

              saveAgent(agentId);
            }}
            className="rounded-md border px-3 py-2 text-sm"
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
        </div>
      </div>
    </header>
  );
}