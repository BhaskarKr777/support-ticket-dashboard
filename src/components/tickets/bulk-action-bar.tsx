"use client";

import { useState } from "react";
import type { TicketStatus } from "@/types/ticket";

interface BulkActionBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onBulkClaim: () => void;
  onBulkStatusChange: (status: TicketStatus) => void;
  isProcessing: boolean;
}

export function BulkActionBar({
  selectedCount,
  onClearSelection,
  onBulkClaim,
  onBulkStatusChange,
  isProcessing,
}: BulkActionBarProps) {
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);

  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 flex-wrap items-center gap-3 rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-white shadow-2xl transition-all animate-in fade-in slide-in-from-bottom-4 sm:px-6">
      <div className="flex items-center gap-2 border-r border-slate-700 pr-3 sm:pr-4">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold">
          {selectedCount}
        </span>
        <span className="text-xs font-medium text-slate-200 sm:text-sm">
          selected
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={isProcessing}
          onClick={onBulkClaim}
          className="inline-flex min-h-9 items-center justify-center rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold !text-white shadow-sm transition hover:bg-indigo-500 disabled:opacity-50 sm:text-sm"
        >
          {isProcessing ? "Processing..." : "Claim selected"}
        </button>

        <div className="relative">
          <button
            type="button"
            disabled={isProcessing}
            onClick={() => setStatusDropdownOpen((prev) => !prev)}
            className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3.5 py-1.5 text-xs font-semibold text-slate-200 transition hover:bg-slate-700 disabled:opacity-50 sm:text-sm"
          >
            Change status
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {statusDropdownOpen && (
            <div className="absolute bottom-full left-0 mb-2 w-44 rounded-xl border border-slate-700 bg-slate-800 p-1 shadow-xl">
              <button
                type="button"
                onClick={() => {
                  setStatusDropdownOpen(false);
                  onBulkStatusChange("open");
                }}
                className="block w-full rounded-lg px-3 py-2 text-left text-xs font-medium text-slate-200 transition hover:bg-slate-700"
              >
                Mark as Open
              </button>
              <button
                type="button"
                onClick={() => {
                  setStatusDropdownOpen(false);
                  onBulkStatusChange("in_progress");
                }}
                className="block w-full rounded-lg px-3 py-2 text-left text-xs font-medium text-slate-200 transition hover:bg-slate-700"
              >
                Mark as In Progress
              </button>
              <button
                type="button"
                onClick={() => {
                  setStatusDropdownOpen(false);
                  onBulkStatusChange("resolved");
                }}
                className="block w-full rounded-lg px-3 py-2 text-left text-xs font-medium text-slate-200 transition hover:bg-slate-700"
              >
                Mark as Resolved
              </button>
            </div>
          )}
        </div>
      </div>

      <button
        type="button"
        disabled={isProcessing}
        onClick={onClearSelection}
        className="ml-auto text-xs font-medium text-slate-400 hover:text-white hover:underline"
      >
        Clear
      </button>
    </div>
  );
}
