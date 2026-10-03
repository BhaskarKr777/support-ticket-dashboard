"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/store/store";
import { prependNewTickets, updateTicketInState } from "@/store/ticketSlice";
import type { Ticket } from "@/types/ticket";

interface TicketUpdate {
  ticket_id: string;
  type: "created" | "updated";
  updated_at: string;
}

export function LiveUpdatesListener() {
  const dispatch = useDispatch<AppDispatch>();
  const lastCheckedRef = useRef<string>(new Date().toISOString());

  const [pendingNewTickets, setPendingNewTickets] = useState<Ticket[]>([]);
  const [isChecking, setIsChecking] = useState(false);

  const fetchUpdatedTicket = useCallback(async (ticketId: string): Promise<Ticket | null> => {
    try {
      const res = await fetch(`/api/tickets/${encodeURIComponent(ticketId)}`, {
        cache: "no-store",
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data.ticket ?? null;
    } catch {
      return null;
    }
  }, []);

  const checkForUpdates = useCallback(async () => {
    if (isChecking) return;
    setIsChecking(true);

    const sinceParam = lastCheckedRef.current;
    const nowTimestamp = new Date().toISOString();

    try {
      const response = await fetch(
        `/api/tickets/updates?since=${encodeURIComponent(sinceParam)}`,
        { cache: "no-store" },
      );

      if (!response.ok) return;

      const data: { updates: TicketUpdate[] } = await response.json();
      const updates = data.updates || [];

      if (updates.length > 0) {
        lastCheckedRef.current = nowTimestamp;

        const newTicketsFetched: Ticket[] = [];

        for (const update of updates) {
          if (update.type === "created") {
            const ticket = await fetchUpdatedTicket(update.ticket_id);
            if (ticket) {
              newTicketsFetched.push(ticket);
            }
          } else if (update.type === "updated") {
            const ticket = await fetchUpdatedTicket(update.ticket_id);
            if (ticket) {
              dispatch(updateTicketInState(ticket));
            }
          }
        }

        if (newTicketsFetched.length > 0) {
          setPendingNewTickets((prev) => {
            const existingIds = new Set(prev.map((t) => t.id));
            const fresh = newTicketsFetched.filter((t) => !existingIds.has(t.id));
            return [...fresh, ...prev];
          });
        }
      }
    } catch (error) {
      console.error("Live updates polling error:", error);
    } finally {
      setIsChecking(false);
    }
  }, [dispatch, fetchUpdatedTicket, isChecking]);

  useEffect(() => {
    const interval = setInterval(() => {
      void checkForUpdates();
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(interval);
  }, [checkForUpdates]);

  const handleShowNewTickets = () => {
    if (pendingNewTickets.length === 0) return;
    dispatch(prependNewTickets(pendingNewTickets));
    setPendingNewTickets([]);
  };

  if (pendingNewTickets.length === 0) return null;

  return (
    <div className="sticky top-16 z-30 mb-4 flex animate-in fade-in slide-in-from-top-2 items-center justify-between gap-3 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 shadow-md sm:px-5">
      <div className="flex items-center gap-2 text-sm font-medium text-indigo-900">
        <span className="flex h-2 w-2 rounded-full bg-indigo-600 animate-ping" />
        <span>
          <strong>{pendingNewTickets.length}</strong> new{" "}
          {pendingNewTickets.length === 1 ? "ticket" : "tickets"} arrived
        </span>
      </div>

      <button
        type="button"
        onClick={handleShowNewTickets}
        className="rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold !text-white shadow-sm transition hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
      >
        Show new tickets
      </button>
    </div>
  );
}
