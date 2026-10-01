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

export default function TicketsPage() {
  const dispatch =
    useDispatch<AppDispatch>();

  const tickets = useSelector(
    (state: RootState) =>
      state.tickets.tickets,
  );

  const loading = useSelector(
    (state: RootState) =>
      state.tickets.loading,
  );

  const loadingMore = useSelector(
    (state: RootState) =>
      state.tickets.loadingMore,
  );

  const error = useSelector(
    (state: RootState) =>
      state.tickets.error,
  );

  const page = useSelector(
    (state: RootState) =>
      state.tickets.page,
  );

  const totalPages = useSelector(
    (state: RootState) =>
      state.tickets.totalPages,
  );

  const total = useSelector(
    (state: RootState) =>
      state.tickets.total,
  );

  const filters = useSelector(
    (state: RootState) =>
      state.ticketFilters,
  );

  /*
   * Read the initial search value directly from
   * the URL so we don't need setState inside an effect.
   */
  const [searchInput, setSearchInput] =
    useState(() => {
      if (
        typeof window ===
        "undefined"
      ) {
        return "";
      }

      return (
        new URLSearchParams(
          window.location.search,
        ).get("search") ?? ""
      );
    });

  /*
   * Used to prevent the normal filter-fetch effect
   * from running twice during initial URL setup.
   */
  const skipNextFilterFetch =
    useRef(false);

  const urlInitialized =
    useRef(false);

  const loadMoreRef =
    useRef<HTMLDivElement | null>(null);

  /*
   * --------------------------------------------------
   * Restore filters from URL
   * --------------------------------------------------
   */

  useEffect(() => {
    const params = new URLSearchParams(
      window.location.search,
    );

    const urlSearch =
      params.get("search") ?? "";

    const urlStatus =
      params.get("status") ?? "";

    const urlPriority =
      params.get("priority") ?? "";

    const urlCategory =
      params.get("category") ?? "";

    const urlTriageDecision =
      params.get("triage_decision") ?? "";

    /*
     * Mark this so the normal filter-fetch effect
     * doesn't immediately make another request.
     */
    skipNextFilterFetch.current = true;
    urlInitialized.current = true;

    /*
     * Update Redux from URL.
     */

    if (urlSearch) {
      dispatch(setSearch(urlSearch));
    }

    if (urlStatus) {
      dispatch(setStatus(urlStatus));
    }

    if (urlPriority) {
      dispatch(setPriority(urlPriority));
    }

    if (urlCategory) {
      dispatch(setCategory(urlCategory));
    }

    if (urlTriageDecision) {
      dispatch(
        setTriageDecision(
          urlTriageDecision,
        ),
      );
    }

    /*
     * Fetch directly using the URL values.
     * This avoids waiting for the Redux render cycle.
     */

    dispatch(
      fetchTickets({
        page: 1,
        append: false,
        query: {
          search: urlSearch,
          status: urlStatus,
          priority: urlPriority,
          category: urlCategory,
          triageDecision:
            urlTriageDecision,
        },
      }),
    );
  }, [dispatch]);

  /*
   * --------------------------------------------------
   * Debounced search
   * --------------------------------------------------
   */

  useEffect(() => {
    if (!urlInitialized.current) {
      return;
    }

    const timeout = setTimeout(() => {
      if (
        searchInput !==
        filters.search
      ) {
        dispatch(
          setSearch(searchInput),
        );
      }
    }, 300);

    return () => {
      clearTimeout(timeout);
    };
  }, [
    dispatch,
    searchInput,
    filters.search,
  ]);

  /*
   * --------------------------------------------------
   * Sync Redux filters -> URL
   * --------------------------------------------------
   */

  useEffect(() => {
    if (!urlInitialized.current) {
      return;
    }

    const params =
      new URLSearchParams();

    if (filters.search) {
      params.set(
        "search",
        filters.search,
      );
    }

    if (filters.status) {
      params.set(
        "status",
        filters.status,
      );
    }

    if (filters.priority) {
      params.set(
        "priority",
        filters.priority,
      );
    }

    if (filters.category) {
      params.set(
        "category",
        filters.category,
      );
    }

    if (filters.triageDecision) {
      params.set(
        "triage_decision",
        filters.triageDecision,
      );
    }

    const queryString =
      params.toString();

    const newUrl = queryString
      ? `/tickets?${queryString}`
      : "/tickets";

    window.history.replaceState(
      null,
      "",
      newUrl,
    );
  }, [filters]);

  /*
   * --------------------------------------------------
   * Fetch when Redux filters change
   * --------------------------------------------------
   */

  useEffect(() => {
    if (!urlInitialized.current) {
      return;
    }

    if (skipNextFilterFetch.current) {
      skipNextFilterFetch.current =
        false;

      return;
    }

    dispatch(
      fetchTickets({
        page: 1,
        append: false,
        query: filters,
      }),
    );
  }, [dispatch, filters]);

  /*
   * --------------------------------------------------
   * Pagination
   * --------------------------------------------------
   */

  const hasMore =
    !loading &&
    !loadingMore &&
    page < totalPages;

  useEffect(() => {
    const element =
      loadMoreRef.current;

    if (!element || !hasMore) {
      return;
    }

    const observer =
      new IntersectionObserver(
        (entries) => {
          const firstEntry =
            entries[0];

          if (
            firstEntry?.isIntersecting
          ) {
            dispatch(
              fetchTickets({
                page: page + 1,
                append: true,
                query: filters,
              }),
            );
          }
        },
        {
          rootMargin: "400px",
        },
      );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [
    dispatch,
    filters,
    hasMore,
    page,
  ]);

  /*
   * --------------------------------------------------
   * Category options
   * --------------------------------------------------
   */

  const categories = [
    "billing",
    "technical",
    "account",
    "shipping",
    "refund",
    "urgent_billing",
  ];

  /*
   * --------------------------------------------------
   * Retry
   * --------------------------------------------------
   */

  const loadFirstPage =
    useCallback(() => {
      dispatch(
        fetchTickets({
          page: 1,
          append: false,
          query: filters,
        }),
      );
    }, [dispatch, filters]);

  /*
   * --------------------------------------------------
   * UI
   * --------------------------------------------------
   */

  return (
    <main className="mx-auto w-full max-w-[1600px] px-4 py-6">
      <TicketClock />

      <div className="mb-6">
        <h2 className="text-2xl font-semibold">
          Tickets
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Showing{" "}
          {tickets.length.toLocaleString()}{" "}
          of{" "}
          {total.toLocaleString()}{" "}
          tickets
        </p>
      </div>

      {/* Filters */}

      <div className="mb-6 grid gap-3 rounded-lg border bg-white p-4 md:grid-cols-2 lg:grid-cols-6">
        {/* Search */}

        <input
          value={searchInput}
          onChange={(event) =>
            setSearchInput(
              event.target.value,
            )
          }
          placeholder="Search tickets..."
          className="h-10 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-black/10"
        />

        {/* Status */}

        <select
          value={filters.status}
          onChange={(event) =>
            dispatch(
              setStatus(
                event.target.value,
              ),
            )
          }
          className="h-10 rounded-md border px-3 text-sm"
        >
          <option value="">
            All statuses
          </option>

          <option value="open">
            Open
          </option>

          <option value="in_progress">
            In progress
          </option>

          <option value="resolved">
            Resolved
          </option>

          <option value="closed">
            Closed
          </option>
        </select>

        {/* Priority */}

        <select
          value={filters.priority}
          onChange={(event) =>
            dispatch(
              setPriority(
                event.target.value,
              ),
            )
          }
          className="h-10 rounded-md border px-3 text-sm"
        >
          <option value="">
            All priorities
          </option>

          <option value="P0">
            P0
          </option>

          <option value="P1">
            P1
          </option>

          <option value="P2">
            P2
          </option>

          <option value="P3">
            P3
          </option>
        </select>

        {/* Category */}

        <select
          value={filters.category}
          onChange={(event) =>
            dispatch(
              setCategory(
                event.target.value,
              ),
            )
          }
          className="h-10 rounded-md border px-3 text-sm"
        >
          <option value="">
            All categories
          </option>

          {categories.map(
            (category) => (
              <option
                key={category}
                value={category}
              >
                {category}
              </option>
            ),
          )}
        </select>

        {/* AI decision */}

        <select
          value={
            filters.triageDecision
          }
          onChange={(event) =>
            dispatch(
              setTriageDecision(
                event.target.value,
              ),
            )
          }
          className="h-10 rounded-md border px-3 text-sm"
        >
          <option value="">
            All AI decisions
          </option>

          <option value="auto_accept">
            Auto accept
          </option>

          <option value="manual_review">
            Manual review
          </option>
        </select>

        {/* Clear */}

        <button
          type="button"
          onClick={() => {
            setSearchInput("");
            dispatch(clearFilters());
          }}
          className="h-10 rounded-md border px-3 text-sm hover:bg-gray-50"
        >
          Clear filters
        </button>
      </div>

      {/* Loading */}

      {loading && (
        <div className="rounded-lg border bg-white p-8 text-center text-sm">
          Loading tickets...
        </div>
      )}

      {/* Error */}

      {!loading && error && (
        <div className="rounded-lg border bg-white p-8 text-center">
          <p className="text-sm text-red-600">
            {error}
          </p>

          <button
            type="button"
            onClick={loadFirstPage}
            className="mt-4 rounded-md bg-black px-4 py-2 text-sm text-white"
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty */}

      {!loading &&
        !error &&
        tickets.length === 0 && (
          <div className="rounded-lg border bg-white p-8 text-center text-sm text-muted-foreground">
            No tickets found.
          </div>
        )}

      {/* Ticket table */}

      {!loading &&
        !error &&
        tickets.length > 0 && (
          <>
            <div className="overflow-x-auto rounded-lg border bg-white">
              <table className="w-full min-w-[1100px] text-sm">
                <thead className="border-b bg-gray-50 text-left">
                  <tr>
                    <th className="px-4 py-3 font-medium">
                      Subject
                    </th>

                    <th className="px-4 py-3 font-medium">
                      Plan
                    </th>

                    <th className="px-4 py-3 font-medium">
                      Category
                    </th>

                    <th className="px-4 py-3 font-medium">
                      Priority
                    </th>

                    <th className="px-4 py-3 font-medium">
                      Status
                    </th>

                    <th className="px-4 py-3 font-medium">
                      Agent
                    </th>

                    <th className="px-4 py-3 font-medium">
                      Created
                    </th>

                    <th className="px-4 py-3 font-medium">
                      Deadline
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {tickets.map(
                    (ticket) => (
                      <tr
                        key={ticket.id}
                        className="hover:bg-gray-50"
                      >
                        <td className="max-w-[350px] px-4 py-3">
                          <Link
                            href={`/tickets/${ticket.id}`}
                            className="font-medium hover:underline"
                          >
                            {ticket.subject ||
                              "(No subject)"}
                          </Link>

                          <div className="mt-1 text-xs text-muted-foreground">
                            {
                              ticket.external_id
                            }
                          </div>
                        </td>

                        <td className="px-4 py-3 capitalize">
                          {
                            ticket.customer_plan
                          }
                        </td>

                        <td className="px-4 py-3">
                          {ticket.category}
                        </td>

                        <td className="px-4 py-3 font-medium">
                          {ticket.priority}
                        </td>

                        <td className="px-4 py-3">
                          {ticket.status.replace(
                            "_",
                            " ",
                          )}
                        </td>

                        <td className="px-4 py-3">
                          {ticket.assigned_to ??
                            "Unassigned"}
                        </td>

                        <td className="whitespace-nowrap px-4 py-3">
                          {new Date(
                            ticket.created_at,
                          ).toLocaleString()}
                        </td>

                        <td className="px-4 py-3">
                          <DeadlineCountdown
                            createdAt={
                              ticket.created_at
                            }
                            priority={
                              ticket.priority
                            }
                          />
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>

            {/* Infinite loading sentinel */}

            <div
              ref={loadMoreRef}
              className="h-20"
            />

            {loadingMore && (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Loading more tickets...
              </div>
            )}

            {!hasMore &&
              tickets.length > 0 && (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  All tickets loaded.
                </div>
              )}
          </>
        )}
    </main>
  );
}