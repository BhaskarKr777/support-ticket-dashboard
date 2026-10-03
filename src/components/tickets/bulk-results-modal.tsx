"use client";

import type { Ticket } from "@/types/ticket";

export interface BulkOperationResult {
  ticketId: string;
  externalId: string;
  subject: string;
  success: boolean;
  error?: string;
  updatedTicket?: Ticket;
}

interface BulkResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRetryFailed?: (failedResultIds: string[]) => void;
  results: BulkOperationResult[];
  actionName: string;
}

export function BulkResultsModal({
  isOpen,
  onClose,
  onRetryFailed,
  results,
  actionName,
}: BulkResultsModalProps) {
  if (!isOpen) return null;

  const successCount = results.filter((r) => r.success).length;
  const failureCount = results.filter((r) => !r.success).length;
  const failedItems = results.filter((r) => !r.success);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="border-b border-slate-100 px-6 py-4">
          <h3 className="text-lg font-semibold text-slate-900">
            Bulk {actionName} Results
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Processed {results.length} {results.length === 1 ? "ticket" : "tickets"} (
            <span className="font-semibold text-emerald-600">{successCount} succeeded</span>
            {failureCount > 0 && (
              <span className="font-semibold text-rose-600">, {failureCount} failed</span>
            )}
            )
          </p>
        </div>

        <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 p-4">
          {results.map((res) => (
            <div key={res.ticketId} className="flex items-start gap-3 py-3">
              <span
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${
                  res.success ? "bg-emerald-500" : "bg-rose-500"
                }`}
              >
                {res.success ? (
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </span>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-slate-500">
                  {res.externalId}
                </p>
                <p className="truncate text-sm font-medium text-slate-900">
                  {res.subject || "(No subject)"}
                </p>

                {!res.success && (
                  <p className="mt-1 text-xs text-rose-600 font-medium">
                    {res.error || "Operation failed"}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50 px-6 py-3.5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Close
          </button>

          {failureCount > 0 && onRetryFailed && (
            <button
              type="button"
              onClick={() => onRetryFailed(failedItems.map((f) => f.ticketId))}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold !text-white hover:bg-indigo-700 shadow-sm"
            >
              Retry Failed ({failureCount})
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
