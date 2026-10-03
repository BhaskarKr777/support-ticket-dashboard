
"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useDispatch, useSelector } from "react-redux";

import type {
  AppDispatch,
  RootState,
} from "@/store/store";

import { fetchTickets } from "@/store/ticketSlice";

import {
  clearFilters,
  setCategory,
  setPriority,
  setSearch,
  setStatus,
  setTriageDecision,
} from "@/store/ticketFilterSlice";

import { TicketClock } from "@/components/tickets/ticket-clock";
import { DeadlineCountdown } from "@/components/tickets/deadline-countdown";
import { TicketFilters } from "@/components/tickets/ticket-filters";

function getPriorityStyles(priority: string) {
  switch (priority) {
    case "P0":
      return "border-rose-200 bg-rose-50 text-rose-700";
    case "P1":
      return "border-orange-200 bg-orange-50 text-orange-700";
    case "P2":
      return "border-amber-200 bg-amber-50 text-amber-800";
    case "P3":
      return "border-sky-200 bg-sky-50 text-sky-700";
    default:
      return "border-slate-200 bg-slate-100 text-slate-700";
  }
}

function getStatusStyles(status: string) {
  switch (status) {
    case "open":
      return "border-sky-200 bg-sky-50 text-sky-700";
    case "in_progress":
      return "border-violet-200 bg-violet-50 text-violet-700";
    case "resolved":
      return "border-teal-200 bg-teal-50 text-teal-700";
    case "closed":
      return "border-slate-200 bg-slate-100 text-slate-600";
    default:
      return "border-slate-200 bg-slate-50 text-slate-700";
  }
}

function formatLabel(value: string) {
  return value.replace(/_/g, " ");
}

export default function TicketsPage() {
  const dispatch = useDispatch<AppDispatch>();

  const {
    tickets,
    loading,
    loadingMore,
    error,
    page,
    totalPages,
    total,
  } = useSelector((state: RootState) => state.tickets);

  const filters = useSelector(
    (state: RootState) => state.ticketFilters
  );

  const [searchInput, setSearchInput] = useState(
  () => new URLSearchParams(
    typeof window !== "undefined" ? window.location.search : ""
  ).get("search") ?? ""
);

  const initialized = useRef(false);
  const skipNextFilterFetch = useRef(false);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  // Restore filters from the URL and fetch the initial page.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const initialFilters = {
      search: params.get("search") ?? "",
      status: params.get("status") ?? "",
      priority: params.get("priority") ?? "",
      category: params.get("category") ?? "",
      triageDecision: params.get("triage_decision") ?? "",
    };

    skipNextFilterFetch.current = true;

    if (initialFilters.search) {
      dispatch(setSearch(initialFilters.search));
    }

    if (initialFilters.status) {
      dispatch(setStatus(initialFilters.status));
    }

    if (initialFilters.priority) {
      dispatch(setPriority(initialFilters.priority));
    }

    if (initialFilters.category) {
      dispatch(setCategory(initialFilters.category));
    }

    if (initialFilters.triageDecision) {
      dispatch(setTriageDecision(initialFilters.triageDecision));
    }

    initialized.current = true;

    dispatch(
      fetchTickets({
        page: 1,
        append: false,
        query: initialFilters,
      })
    );
  }, [dispatch]);

  // Debounce search before updating Redux.
  useEffect(() => {
    if (!initialized.current) return;

    const timeout = window.setTimeout(() => {
      if (searchInput !== filters.search) {
        dispatch(setSearch(searchInput));
      }
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [dispatch, searchInput, filters.search]);

  // Keep the URL synchronized with active filters.
  useEffect(() => {
    if (!initialized.current) return;

    const params = new URLSearchParams();

    if (filters.search) params.set("search", filters.search);
    if (filters.status) params.set("status", filters.status);
    if (filters.priority) params.set("priority", filters.priority);
    if (filters.category) params.set("category", filters.category);

    if (filters.triageDecision) {
      params.set("triage_decision", filters.triageDecision);
    }

    const queryString = params.toString();

    window.history.replaceState(
      null,
      "",
      queryString ? `/tickets?${queryString}` : "/tickets"
    );
  }, [filters]);

  // Fetch the first page whenever filters change.
  useEffect(() => {
    if (!initialized.current) return;

    if (skipNextFilterFetch.current) {
      skipNextFilterFetch.current = false;
      return;
    }

    dispatch(
      fetchTickets({
        page: 1,
        append: false,
        query: filters,
      })
    );
  }, [dispatch, filters]);

  const hasMore =
    !loading &&
    !loadingMore &&
    page < totalPages;

  // Load additional pages as the user scrolls.
  useEffect(() => {
    const element = loadMoreRef.current;

    if (!element || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          dispatch(
            fetchTickets({
              page: page + 1,
              append: true,
              query: filters,
            })
          );
        }
      },
      { rootMargin: "400px" }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [dispatch, filters, hasMore, page]);

  const handleRetry = useCallback(() => {
    dispatch(
      fetchTickets({
        page: 1,
        append: false,
        query: filters,
      })
    );
  }, [dispatch, filters]);

  const handleClearFilters = useCallback(() => {
    setSearchInput("");
    dispatch(clearFilters());
  }, [dispatch]);

  return (
    <main className="min-h-[calc(100vh-64px)] bg-[#f8f6ef] text-[#202943]">
      <TicketClock />

      <div className="mx-auto w-full max-w-[1600px] px-4 py-8 sm:px-6 lg:px-10">
        {/* Page heading */}
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#6579b8]">
              Support workspace
            </p>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#202943] sm:text-4xl">
              Tickets
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-[#68738a]">
              Manage customer requests, review ticket details, and
              keep track of SLA deadlines.
            </p>
          </div>

          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#dce3f3] bg-white px-4 py-2.5 text-sm text-[#68738a] shadow-sm">
            <span
              className="h-2 w-2 rounded-full bg-[#65a99a]"
              aria-hidden="true"
            />
            Showing{" "}
            <span className="font-semibold text-[#202943]">
              {tickets.length.toLocaleString()}
            </span>
            {" "}of{" "}
            <span className="font-semibold text-[#202943]">
              {total.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Search and filters */}
        <div className="mb-6">
          <TicketFilters
            searchInput={searchInput}
            onSearchChange={setSearchInput}
            status={filters.status}
            onStatusChange={(value) => dispatch(setStatus(value))}
            priority={filters.priority}
            onPriorityChange={(value) =>
              dispatch(setPriority(value))
            }
            category={filters.category}
            onCategoryChange={(value) =>
              dispatch(setCategory(value))
            }
            triageDecision={filters.triageDecision}
            onTriageDecisionChange={(value) =>
              dispatch(setTriageDecision(value))
            }
            onClear={handleClearFilters}
          />
        </div>

        {/* Initial loading state */}
        {loading && (
          <div className="rounded-2xl border border-[#e4e5ef] bg-white px-6 py-16 text-center shadow-[0_4px_16px_rgba(32,41,67,0.04)]">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-[3px] border-[#e5e7f5] border-t-[#8586c9]" />

            <p className="mt-4 font-semibold text-[#202943]">
              Loading tickets...
            </p>

            <p className="mt-1 text-sm text-[#7b8498]">
              Please wait while we fetch your results.
            </p>
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div
            role="alert"
            className="rounded-2xl border border-rose-200 bg-white p-8 text-center shadow-sm"
          >
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-rose-50 text-lg font-bold text-rose-600">
              !
            </div>

            <h2 className="mt-4 font-semibold text-[#202943]">
              Unable to load tickets
            </h2>

            <p className="mt-2 text-sm text-rose-600">{error}</p>

            <button
              type="button"
              onClick={handleRetry}
              className="mt-5 rounded-xl bg-[#7779bd] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#6567a8]"
            >
              Try again
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && tickets.length === 0 && (
          <div className="rounded-2xl border border-dashed border-[#d7dbe7] bg-white px-6 py-16 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eaf1f8] text-xl text-[#6579b8]">
              <span aria-hidden="true">⌕</span>
            </div>

            <h2 className="mt-4 text-lg font-semibold text-[#202943]">
              No tickets found
            </h2>

            <p className="mt-2 text-sm text-[#7b8498]">
              Try a different keyword or remove some filters.
            </p>

            <button
              type="button"
              onClick={handleClearFilters}
              className="mt-5 rounded-xl border border-[#dce1ed] bg-white px-4 py-2.5 text-sm font-semibold text-[#4d5a78] transition-colors hover:bg-[#f4f5fa]"
            >
              Clear filters
            </button>
          </div>
        )}

        {/* Ticket table */}
        {/* Ticket table and mobile cards */}
        {!loading && !error && tickets.length > 0 && (
          <>
            <div className="overflow-hidden rounded-2xl border border-[#e1e4ec] bg-white shadow-[0_5px_22px_rgba(32,41,67,0.045)]">
              <div className="flex flex-col gap-1 border-b border-[#e8eaf0] bg-[#edf2f8] px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4">
                <h2 className="font-semibold text-[#27334f]">
                  All tickets
                </h2>

                <p className="text-xs text-[#77829a]">
                  Select a ticket to view its details
                </p>
              </div>

              {/* Mobile Card List (< md screens) */}
              <div className="divide-y divide-[#edf0f4] md:hidden">
                {tickets.map((ticket) => (
                  <article key={ticket.id} className="p-4 transition-colors hover:bg-[#f8f9fe]">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5 text-xs text-[#8992a5]">
                          <span>Ext: {ticket.external_id}</span>
                          <span>•</span>
                          <span>{ticket.customer_plan}</span>
                        </div>

                        <Link
                          href={`/tickets/${ticket.id}`}
                          className="mt-1.5 block break-words font-semibold text-[#303c5b] transition-colors hover:text-[#7779bd]"
                        >
                          {ticket.subject
                            ? ticket.subject.replace(/<[^>]*>/g, "")
                            : "(No subject)"}
                        </Link>
                      </div>

                      <span
                        className={`shrink-0 inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold ${getPriorityStyles(ticket.priority)}`}
                      >
                        {ticket.priority}
                      </span>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[#f0f2f7] pt-2.5 text-xs text-[#68738a]">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold capitalize ${getStatusStyles(ticket.status)}`}
                        >
                          {formatLabel(ticket.status)}
                        </span>
                        <span className="capitalize">{formatLabel(ticket.category)}</span>
                      </div>

                      <DeadlineCountdown
                        createdAt={ticket.created_at}
                        priority={ticket.priority}
                      />
                    </div>
                  </article>
                ))}
              </div>

              {/* Desktop / Tablet Table View (>= md screens) */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[1100px] text-left text-sm">
                  <thead className="border-b border-[#e5e8ef] bg-[#f6f8fb]">
                    <tr>
                      <th scope="col" className="px-5 py-4 font-semibold text-[#64708a]">
                        Subject
                      </th>
                      <th scope="col" className="px-4 py-4 font-semibold text-[#64708a]">
                        Plan
                      </th>
                      <th scope="col" className="px-4 py-4 font-semibold text-[#64708a]">
                        Category
                      </th>
                      <th scope="col" className="px-4 py-4 font-semibold text-[#64708a]">
                        Priority
                      </th>
                      <th scope="col" className="px-4 py-4 font-semibold text-[#64708a]">
                        Status
                      </th>
                      <th scope="col" className="px-4 py-4 font-semibold text-[#64708a]">
                        Agent
                      </th>
                      <th scope="col" className="px-4 py-4 font-semibold text-[#64708a]">
                        Created
                      </th>
                      <th scope="col" className="px-4 py-4 font-semibold text-[#64708a]">
                        SLA deadline
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-[#edf0f4]">
                    {tickets.map((ticket) => (
                      <tr
                        key={ticket.id}
                        className="transition-colors hover:bg-[#f5f6fc]"
                      >
                        <td className="max-w-[350px] px-5 py-4">
                          <Link
                            href={`/tickets/${ticket.id}`}
                            className="break-words font-semibold leading-5 text-[#303c5b] transition-colors hover:text-[#7779bd] hover:underline"
                          >
                            {ticket.subject
                              ? ticket.subject.replace(/<[^>]*>/g, "")
                              : "(No subject)"}
                          </Link>

                          <div className="mt-1.5 flex flex-wrap gap-x-2 text-xs text-[#8992a5]">
                            <span>External: {ticket.external_id}</span>
                            <span>Internal: {ticket.id}</span>
                          </div>
                        </td>

                        <td className="px-4 py-4 capitalize text-[#68738a]">
                          {ticket.customer_plan}
                        </td>

                        <td className="px-4 py-4 text-[#68738a]">
                          {formatLabel(ticket.category)}
                        </td>

                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-bold ${getPriorityStyles(ticket.priority)}`}
                          >
                            {ticket.priority}
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${getStatusStyles(ticket.status)}`}
                          >
                            {formatLabel(ticket.status)}
                          </span>
                        </td>

                        <td className="px-4 py-4 text-[#68738a]">
                          {ticket.assigned_to ?? "Unassigned"}
                        </td>

                        <td className="whitespace-nowrap px-4 py-4 text-[#68738a]">
                          {new Date(ticket.created_at).toLocaleString()}
                        </td>

                        <td className="whitespace-nowrap px-4 py-4">
                          <DeadlineCountdown
                            createdAt={ticket.created_at}
                            priority={ticket.priority}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Infinite-scroll sentinel */}
            <div
              ref={loadMoreRef}
              className="h-10"
              aria-hidden="true"
            />

            {loadingMore && (
              <div className="flex items-center justify-center gap-3 py-6 text-sm text-[#77829a]">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#e5e7f5] border-t-[#8586c9]" />
                Loading more tickets...
              </div>
            )}

            {!hasMore && (
              <p className="py-6 text-center text-sm text-[#8992a5]">
                You&apos;ve reached the end of the ticket list.
              </p>
            )}
          </>
        )}
      </div>
    </main>
  );
}