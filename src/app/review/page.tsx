
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { Ticket, TicketPriority } from "@/types/ticket";

interface TicketsResponse {
  tickets: Ticket[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const PAGE_SIZE = 100;

const categories = [
  "billing",
  "technical",
  "account",
  "shipping",
  "refund",
  "general",
  "bug",
];

const priorities: TicketPriority[] = ["P0", "P1", "P2", "P3"];

export default function ReviewPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("general");
  const [selectedPriority, setSelectedPriority] =
    useState<TicketPriority>("P2");
  const [reason, setReason] = useState("");
  const [actionError, setActionError] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);

  const loadTickets = useCallback(async (pageNumber: number) => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `/api/tickets?triage_decision=manual_review&page=${pageNumber}&limit=${PAGE_SIZE}`,
      );

      if (!response.ok) {
        throw new Error("Unable to load the review queue.");
      }

      const data: TicketsResponse = await response.json();

      setTickets(data.tickets);
      setTotal(data.total);
      setPage(data.page);
      setTotalPages(Math.max(data.totalPages, 1));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while loading tickets.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadTickets(1);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadTickets]);

  function startEditing(ticket: Ticket) {
    setEditingId(ticket.id);
    setSelectedCategory(ticket.category);

    const validPriority = priorities.includes(ticket.priority)
      ? ticket.priority
      : ticket.customer_plan === "enterprise"
        ? "P1"
        : "P2";

    setSelectedPriority(validPriority);
    setReason("");
    setActionError("");
    setNotice("");
  }

  function cancelEditing() {
    setEditingId(null);
    setReason("");
    setActionError("");
  }

  async function submitReview(
    ticket: Ticket,
    action: "accept" | "edit",
  ) {
    setActionError("");
    setNotice("");

    if (action === "edit" && reason.trim().length < 10) {
      setActionError(
        "Please provide a reason of at least 10 characters.",
      );
      return;
    }

    if (
      action === "edit" &&
      ticket.customer_plan === "enterprise" &&
      !["P0", "P1"].includes(selectedPriority)
    ) {
      setActionError(
        "Enterprise tickets must have priority P0 or P1.",
      );
      return;
    }

    setSavingId(ticket.id);

    try {
      const body =
        action === "accept"
          ? { action: "accept" }
          : {
              action: "edit",
              category: selectedCategory,
              priority: selectedPriority,
              review_reason: reason.trim(),
            };

      const response = await fetch(
        `/api/tickets/${encodeURIComponent(ticket.id)}/triage`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to save this review.",
        );
      }

      setNotice(
        `${ticket.external_id} has been ${
          action === "accept" ? "accepted" : "updated"
        }.`,
      );

      setEditingId(null);
      setReason("");

      await loadTickets(page);
    } catch (err) {
      setActionError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setSavingId(null);
    }
  }

  const buttonBase =
    "inline-flex min-h-11 w-full items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

  const secondaryButton =
    `${buttonBase} border border-slate-300 bg-white text-slate-900 hover:bg-slate-100`;

  const primaryButton =
    `${buttonBase} border border-slate-900 bg-slate-900 !text-white hover:bg-slate-700`;

  const inputClass =
    "block min-h-11 w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200";

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-slate-50">
      <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <header className="mb-7 flex flex-col gap-4 sm:mb-8 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-500">
              Ticket management
            </p>

            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Review queue
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Review tickets flagged by AI before their recommendations
              are accepted.
            </p>
          </div>

          <div className="inline-flex w-fit items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700">
            <span className="h-2 w-2 shrink-0 rounded-full bg-amber-500" />
            <span>
              <strong className="font-semibold text-slate-900">
                {total.toLocaleString()}
              </strong>{" "}
              awaiting review
            </span>
          </div>
        </header>

        {notice && (
          <div
            role="status"
            className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
          >
            <strong>Review saved.</strong> {notice}
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          >
            <p>{error}</p>
            <button
              type="button"
              onClick={() => void loadTickets(page)}
              className="mt-2 font-semibold underline underline-offset-4"
            >
              Try again
            </button>
          </div>
        )}

        {loading ? (
          <div
            role="status"
            className="rounded-xl border border-slate-200 bg-white px-4 py-12 text-center"
          >
            <div className="mx-auto mb-3 h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-slate-800" />
            <p className="text-sm text-slate-600">
              Loading review queue…
            </p>
          </div>
        ) : !error && tickets.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white px-5 py-14 text-center">
            <h2 className="text-lg font-semibold text-slate-900">
              No tickets to review
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              There are no tickets awaiting review on this page.
            </p>
            <button
              type="button"
              onClick={() => void loadTickets(1)}
              className={`${secondaryButton} mx-auto mt-5 max-w-xs`}
            >
              Refresh queue
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {tickets.map((ticket) => {
              const isEditing = editingId === ticket.id;
              const isSaving = savingId === ticket.id;

              const allowedPriorities =
                ticket.customer_plan === "enterprise"
                  ? (["P0", "P1"] as TicketPriority[])
                  : priorities;

              const categoryOptions = categories.includes(ticket.category)
                ? categories
                : [...categories, ticket.category];

              return (
                <article
                  key={ticket.id}
                  className="w-full min-w-0 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 lg:p-6"
                >
                  <div className="flex min-w-0 flex-col gap-5 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="mb-3 flex flex-wrap items-center gap-2">
                        <span className="break-all text-sm font-semibold text-slate-500">
                          {ticket.external_id}
                        </span>

                        <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800">
                          Manual review
                        </span>

                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium capitalize text-slate-700">
                          {ticket.customer_plan}
                        </span>
                      </div>

                      <h2 className="break-words text-base font-semibold leading-6 text-slate-900 sm:text-lg">
                        {ticket.subject}
                      </h2>

                      <p className="mt-2 break-words text-sm leading-6 text-slate-600">
                        {ticket.summary || "No AI summary available."}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-600">
                        <span className="break-words">
                          Category:{" "}
                          <strong className="font-semibold text-slate-900">
                            {ticket.category}
                          </strong>
                        </span>

                        <span>
                          Priority:{" "}
                          <strong className="font-semibold text-slate-900">
                            {ticket.priority}
                          </strong>

                          {!priorities.includes(ticket.priority) && (
                            <span className="ml-2 inline-flex rounded bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700">
                              Invalid value
                            </span>
                          )}
                        </span>
                      </div>

                      <Link
                        href={`/tickets/${encodeURIComponent(ticket.id)}`}
                        className="mt-4 inline-flex min-h-10 items-center text-sm font-medium text-slate-800 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2"
                      >
                        View ticket details
                        <span aria-hidden="true" className="ml-1.5">
                          →
                        </span>
                      </Link>
                    </div>

                    {!isEditing && (
                      <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2 md:w-56 md:shrink-0 md:grid-cols-1 lg:w-64 lg:grid-cols-2">
                        <button
                          type="button"
                          disabled={isSaving}
                          onClick={() => void submitReview(ticket, "accept")}
                          className={secondaryButton}
                        >
                          {isSaving ? "Saving…" : "Accept AI"}
                        </button>

                        <button
                          type="button"
                          disabled={isSaving}
                          onClick={() => startEditing(ticket)}
                          className={primaryButton}
                        >
                          Edit decision
                        </button>
                      </div>
                    )}
                  </div>

                  {isEditing && (
                    <div className="mt-6 border-t border-slate-200 pt-5">
                      <h3 className="text-base font-semibold text-slate-900">
                        Update AI decision
                      </h3>

                      <p className="mt-1 text-sm leading-5 text-slate-600">
                        Correct the category or priority and explain why
                        the recommendation needs to change.
                      </p>

                      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <label className="block min-w-0 text-sm">
                          <span className="mb-1.5 block font-medium text-slate-800">
                            Category
                          </span>

                          <select
                            value={selectedCategory}
                            onChange={(event) =>
                              setSelectedCategory(event.target.value)
                            }
                            className={inputClass}
                          >
                            {categoryOptions.map((category) => (
                              <option key={category} value={category}>
                                {category}
                              </option>
                            ))}
                          </select>
                        </label>

                        <label className="block min-w-0 text-sm">
                          <span className="mb-1.5 block font-medium text-slate-800">
                            Priority
                          </span>

                          <select
                            value={selectedPriority}
                            onChange={(event) =>
                              setSelectedPriority(
                                event.target.value as TicketPriority,
                              )
                            }
                            className={inputClass}
                          >
                            {allowedPriorities.map((priority) => (
                              <option key={priority} value={priority}>
                                {priority}
                              </option>
                            ))}
                          </select>

                          {ticket.customer_plan === "enterprise" && (
                            <span className="mt-1.5 block text-xs leading-5 text-slate-500">
                              Enterprise tickets require P0 or P1.
                            </span>
                          )}

                          {!priorities.includes(ticket.priority) && (
                            <span className="mt-1.5 block text-xs leading-5 text-amber-700">
                              The existing priority is invalid. Select a
                              valid priority before saving.
                            </span>
                          )}
                        </label>
                      </div>

                      <label className="mt-5 block text-sm">
                        <span className="mb-1.5 block font-medium text-slate-800">
                          Reason for change
                        </span>

                        <textarea
                          value={reason}
                          onChange={(event) => setReason(event.target.value)}
                          rows={4}
                          maxLength={1000}
                          placeholder="Explain why the category or priority should change…"
                          aria-describedby="review-reason-help"
                          className={`${inputClass} min-h-28 resize-y leading-6`}
                        />

                        <span
                          id="review-reason-help"
                          className={`mt-1.5 block text-xs ${
                            reason.trim().length >= 10
                              ? "text-emerald-700"
                              : "text-slate-500"
                          }`}
                        >
                          {reason.trim().length}/10 minimum characters
                        </span>
                      </label>

                      {actionError && (
                        <p
                          role="alert"
                          className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700"
                        >
                          {actionError}
                        </p>
                      )}

                      <div className="mt-5 grid grid-cols-1 gap-2 sm:flex sm:flex-row sm:justify-end">
                        <button
                          type="button"
                          disabled={isSaving}
                          onClick={cancelEditing}
                          className={`${secondaryButton} sm:w-auto`}
                        >
                          Cancel
                        </button>

                        <button
                          type="button"
                          disabled={isSaving}
                          onClick={() => void submitReview(ticket, "edit")}
                          className={`${primaryButton} sm:w-auto`}
                        >
                          {isSaving ? "Saving review…" : "Save review"}
                        </button>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}

            <nav
              aria-label="Review queue pagination"
              className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <p className="text-center text-sm text-slate-600 sm:text-left">
                Page{" "}
                <strong className="font-semibold text-slate-900">
                  {page}
                </strong>{" "}
                of{" "}
                <strong className="font-semibold text-slate-900">
                  {totalPages}
                </strong>
              </p>

              <div className="grid grid-cols-2 gap-2 sm:flex">
                <button
                  type="button"
                  disabled={page <= 1 || loading}
                  onClick={() => void loadTickets(page - 1)}
                  className={`${secondaryButton} sm:w-auto`}
                >
                  Previous
                </button>

                <button
                  type="button"
                  disabled={page >= totalPages || loading}
                  onClick={() => void loadTickets(page + 1)}
                  className={`${primaryButton} sm:w-auto`}
                >
                  Next
                </button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </main>
  );
}