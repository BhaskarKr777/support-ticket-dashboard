
"use client";

import {
  isSafeAttachmentUrl,
  sanitizeTicketHtml,
} from "@/lib/sanitize-ticket-html";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

import type { RootState } from "@/store/store";
import type { Ticket } from "@/types/ticket";

type Props = {
  params: Promise<{ id: string }>;
};

function getPriorityStyles(priority: string) {
  switch (priority) {
    case "P0":
      return "border-rose-200 bg-rose-50 text-rose-700";
    case "P1":
      return "border-orange-200 bg-orange-50 text-orange-700";
    case "P2":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "P3":
      return "border-sky-200 bg-sky-50 text-sky-700";
    default:
      return "border-slate-200 bg-slate-50 text-slate-700";
  }
}

function getStatusStyles(status: string) {
  switch (status) {
    case "open":
      return "border-sky-200 bg-sky-50 text-sky-800";
    case "in_progress":
      return "border-violet-200 bg-violet-50 text-violet-800";
    case "resolved":
      return "border-teal-200 bg-teal-50 text-teal-800";
    case "closed":
      return "border-slate-200 bg-slate-100 text-slate-600";
    default:
      return "border-slate-200 bg-slate-50 text-slate-700";
  }
}

function formatLabel(value: string) {
  return value.replace(/_/g, " ");
}

function DetailItem({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </dt>
      <dd className="mt-1.5 break-words text-sm font-medium leading-6 text-slate-800">
        {children}
      </dd>
    </div>
  );
}

function DetailCard({
  title,
  description,
  children,
  variant = "violet",
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  variant?: "violet" | "sky" | "teal";
}) {
  const variants = {
    violet: {
      border: "border-[#e4def8]",
      header: "border-[#e4def8] bg-[#eeebfa]",
      title: "text-[#29234d]",
      description: "text-[#62578d]",
    },
    sky: {
      border: "border-[#d9e9f0]",
      header: "border-[#d9e9f0] bg-[#e7f2f7]",
      title: "text-[#233f50]",
      description: "text-[#547387]",
    },
    teal: {
      border: "border-[#d3ebe5]",
      header: "border-[#d3ebe5] bg-[#e5f4ef]",
      title: "text-[#20483f]",
      description: "text-[#4c796e]",
    },
  };

  const style = variants[variant];

  return (
    <section
      className={`overflow-hidden rounded-2xl border ${style.border} bg-white shadow-[0_3px_12px_rgba(43,48,77,0.045)] transition-shadow duration-200 hover:shadow-[0_6px_18px_rgba(43,48,77,0.07)]`}
    >
      <div className={`border-b px-5 py-4 sm:px-6 ${style.header}`}>
        <h2 className={`font-semibold ${style.title}`}>
          {title}
        </h2>

        {description && (
          <p className={`mt-1 text-sm ${style.description}`}>
            {description}
          </p>
        )}
      </div>

      <div className="p-5 sm:p-6">{children}</div>
    </section>
  );
}

export default function TicketDetailsPage({ params }: Props) {
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");
  const [retriageLoading, setRetriageLoading] = useState(false);

  const currentAgentId = useSelector(
    (state: RootState) => state.agent.currentAgentId
  );

  useEffect(() => {
    let cancelled = false;

    async function loadTicket() {
      try {
        const { id } = await params;

        const response = await fetch(
          `/api/tickets/${encodeURIComponent(id)}`
        );

        if (response.status === 404) {
          if (!cancelled) {
            setError("Ticket not found");
          }
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to load ticket");
        }

        const data = await response.json();

        if (!cancelled) {
          setTicket(data.ticket);
        }
      } catch {
        if (!cancelled) {
          setError("Unable to load ticket. Please try again.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadTicket();

    return () => {
      cancelled = true;
    };
  }, [params]);

  async function handleClaim() {
    if (!ticket || actionLoading || retriageLoading) return;

    setActionError("");
    setActionLoading(true);

    const previousTicket = ticket;

    // Optimistically update the interface while the API responds.
    setTicket({
      ...ticket,
      assigned_to: currentAgentId,
      status: "in_progress",
    });

    try {
      const response = await fetch(
        `/api/tickets/${encodeURIComponent(ticket.id)}/claim`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            agent_id: currentAgentId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          response.status === 409
            ? data.error || "Ticket was already claimed"
            : data.error || "Unable to claim ticket"
        );
      }

      setTicket(data.ticket);
    } catch (error) {
      // Roll back the optimistic update if the request fails.
      setTicket(previousTicket);

      setActionError(
        error instanceof Error
          ? error.message
          : "Unable to claim ticket"
      );
    } finally {
      setActionLoading(false);
    }
  }

  async function handleStatusChange(newStatus: Ticket["status"]) {
    if (!ticket || actionLoading || retriageLoading) return;

    setActionError("");
    setActionLoading(true);

    const previousTicket = ticket;

    setTicket({
      ...ticket,
      status: newStatus,
    });

    try {
      const response = await fetch(
        `/api/tickets/${encodeURIComponent(ticket.id)}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to update ticket status"
        );
      }

      if (!data.ticket) {
        throw new Error("Invalid response from status API");
      }

      setTicket(data.ticket);
    } catch (error) {
      setTicket(previousTicket);

      setActionError(
        error instanceof Error
          ? error.message
          : "Unable to update ticket status"
      );
    } finally {
      setActionLoading(false);
    }
  }

  async function handleRetriage() {
    if (!ticket || actionLoading || retriageLoading) return;

    setActionError("");
    setRetriageLoading(true);

    try {
      const response = await fetch(
        `/api/tickets/${encodeURIComponent(ticket.id)}/retriage-proxy`,
        {
          method: "POST",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to re-triage ticket"
        );
      }

      if (!data.ticket) {
        throw new Error("Invalid response from re-triage API");
      }

      setTicket(data.ticket);
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : "Unable to re-triage ticket"
      );
    } finally {
      setRetriageLoading(false);
    }
  }

  const busy = actionLoading || retriageLoading;

  if (loading) {
    return (
      <main className="min-h-[calc(100vh-64px)] bg-[#f8f6ee] px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-6xl rounded-2xl border border-[#e7e2d7] bg-white p-12 text-center shadow-sm">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-[3px] border-[#e9e3f8] border-t-[#6656a5]" />

          <p className="mt-4 font-semibold text-slate-900">
            Loading ticket...
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Retrieving ticket details.
          </p>
        </div>
      </main>
    );
  }

  if (error || !ticket) {
    return (
      <main className="min-h-[calc(100vh-64px)] bg-[#f8f6ee] px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <Link
            href="/tickets"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-[#6656a5]"
          >
            <span aria-hidden="true">←</span>
            Back to tickets
          </Link>

          <div className="mt-6 rounded-2xl border border-[#e4def8] bg-white p-8 shadow-sm sm:p-12">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 text-xl font-bold text-rose-600">
              !
            </div>

            <h1 className="text-xl font-bold text-slate-900">
              {error || "Ticket not found"}
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              The requested ticket could not be loaded.
            </p>

            <Link
              href="/tickets"
              className="mt-5 inline-flex rounded-lg bg-[#6656a5] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#514386]"
            >
              Return to tickets
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-64px)] bg-[#f8f6ee]">
      <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <Link
          href="/tickets"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-[#6656a5]"
        >
          <span aria-hidden="true">←</span>
          Back to tickets
        </Link>

        <div className="mt-6 space-y-6">
          {actionError && (
            <div
              role="alert"
              className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"
            >
              <span
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-100 font-bold"
                aria-hidden="true"
              >
                !
              </span>

              <p>{actionError}</p>
            </div>
          )}

          {/* Ticket heading and actions */}
          <section className="overflow-hidden rounded-2xl border border-[#e4def8] bg-white shadow-[0_4px_16px_rgba(43,48,77,0.05)]">
            <div className="p-5 sm:p-7">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold text-[#6656a5]">
                      {ticket.external_id}
                    </span>

                    <span className="text-slate-300" aria-hidden="true">
                      /
                    </span>

                    <span className="text-xs text-slate-500">
                      Internal ID: {ticket.id}
                    </span>
                  </div>

                  <h1 className="mt-3 break-words text-2xl font-bold tracking-tight text-[#25223c] sm:text-3xl">
                    {ticket.subject || "(No subject)"}
                  </h1>

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${getPriorityStyles(ticket.priority)}`}
                    >
                      Priority {ticket.priority}
                    </span>

                    <span
                      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold capitalize ${getStatusStyles(ticket.status)}`}
                    >
                      {formatLabel(ticket.status)}
                    </span>

                    {ticket.triage_decision === "manual_review" && (
                      <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
                        Needs review
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap lg:w-auto lg:justify-end">
                  {!ticket.assigned_to && ticket.status === "open" && (
                    <button
                      type="button"
                      onClick={handleClaim}
                      disabled={busy}
                      className="inline-flex min-h-10 w-full items-center justify-center rounded-lg bg-[#6656a5] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#514386] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                    >
                      {actionLoading ? "Claiming..." : "Claim ticket"}
                    </button>
                  )}

                  {ticket.status === "open" && ticket.assigned_to && (
                    <button
                      type="button"
                      onClick={() => handleStatusChange("in_progress")}
                      disabled={busy}
                      className="inline-flex min-h-10 w-full items-center justify-center rounded-lg bg-[#6656a5] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#514386] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                    >
                      {actionLoading ? "Updating..." : "Start work"}
                    </button>
                  )}

                  {ticket.status === "in_progress" && (
                    <button
                      type="button"
                      onClick={() => handleStatusChange("resolved")}
                      disabled={busy}
                      className="inline-flex min-h-10 w-full items-center justify-center rounded-lg bg-[#287d6b] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#206456] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                    >
                      {actionLoading ? "Updating..." : "Resolve ticket"}
                    </button>
                  )}

                  {ticket.status === "resolved" && (
                    <button
                      type="button"
                      onClick={() => handleStatusChange("open")}
                      disabled={busy}
                      className="inline-flex min-h-10 w-full items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-[#c9c0e8] hover:bg-[#f2effb] hover:text-[#514386] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                    >
                      {actionLoading ? "Updating..." : "Reopen ticket"}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleRetriage}
                    disabled={busy}
                    className="inline-flex min-h-10 w-full items-center justify-center rounded-lg border border-[#d8d0f0] bg-[#f0edfa] px-4 py-2 text-sm font-semibold text-[#514386] transition hover:border-[#c9bde9] hover:bg-[#e7e1f7] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                  >
                    {retriageLoading ? "Re-running AI..." : "Re-run AI"}
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Customer and AI information */}
          <div className="grid gap-6 lg:grid-cols-2">
            <DetailCard
              title="Customer information"
              description="Account details and ticket ownership."
              variant="sky"
            >
              <dl className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
                <DetailItem label="Customer ID">
                  {ticket.customer_id}
                </DetailItem>

                <DetailItem label="Plan">
                  <span className="capitalize">
                    {ticket.customer_plan}
                  </span>
                </DetailItem>

                <DetailItem label="Category">
                  {formatLabel(ticket.category)}
                </DetailItem>

                <DetailItem label="Assigned agent">
                  {ticket.assigned_to || "Unassigned"}
                </DetailItem>

                <DetailItem label="Created">
                  {new Date(ticket.created_at).toLocaleString()}
                </DetailItem>
              </dl>
            </DetailCard>

            <DetailCard
              title="AI triage"
              description="Classification and automated assessment."
              variant="violet"
            >
              <dl className="space-y-5">
                <DetailItem label="Decision">
                  <span className="capitalize">
                    {formatLabel(ticket.triage_decision)}
                  </span>
                </DetailItem>

                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    AI summary
                  </dt>

                  {ticket.summary ? (
                    <dd
                      className="prose prose-sm mt-2 max-w-none break-words text-slate-700"
                      dangerouslySetInnerHTML={{
                        __html: sanitizeTicketHtml(ticket.summary),
                      }}
                    />
                  ) : (
                    <dd className="mt-2 text-sm text-slate-500">
                      No summary available.
                    </dd>
                  )}
                </div>

                {ticket.ai_priority &&
                  ticket.ai_priority !== ticket.priority && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                      <p className="text-xs font-bold uppercase tracking-wide text-amber-800">
                        Priority adjusted after review
                      </p>

                      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                        <span className="text-amber-900">
                          AI priority:
                        </span>

                        <span
                          className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${getPriorityStyles(ticket.ai_priority)}`}
                        >
                          {ticket.ai_priority}
                        </span>

                        <span className="text-amber-700" aria-hidden="true">
                          →
                        </span>

                        <span
                          className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${getPriorityStyles(ticket.priority)}`}
                        >
                          {ticket.priority}
                        </span>
                      </div>

                      <p className="mt-3 text-sm leading-6 text-amber-900">
                        {ticket.review_reason ||
                          "No adjustment reason provided."}
                      </p>
                    </div>
                  )}

                <DetailItem label="Review reason">
                  {ticket.review_reason || "No review reason"}
                </DetailItem>
              </dl>
            </DetailCard>
          </div>

          {/* Customer message */}
          <DetailCard
            title="Customer message"
            description="Original content submitted with this ticket."
            variant="teal"
          >
            {ticket.body ? (
              <div
                className="prose prose-sm max-w-none break-words text-slate-700"
                dangerouslySetInnerHTML={{
                  __html: sanitizeTicketHtml(ticket.body),
                }}
              />
            ) : (
              <p className="text-sm text-slate-500">
                No message body was provided.
              </p>
            )}

            {ticket.attachment_url && (
              <div className="mt-6 border-t border-[#d3ebe5] pt-5">
                <p className="text-sm font-semibold text-slate-900">
                  Attachment
                </p>

                {isSafeAttachmentUrl(ticket.attachment_url) ? (
                  <a
                    href={ticket.attachment_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex max-w-full break-all text-sm font-semibold text-[#287d6b] underline decoration-[#b6ddd2] underline-offset-4 transition hover:text-[#205f52]"
                  >
                    Open attachment
                  </a>
                ) : (
                  <p className="mt-2 break-words text-sm text-rose-600">
                    Attachment blocked because the URL is unsafe.
                  </p>
                )}
              </div>
            )}
          </DetailCard>
        </div>
      </div>
    </main>
  );
}