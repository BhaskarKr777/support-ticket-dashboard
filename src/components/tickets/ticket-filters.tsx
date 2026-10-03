
"use client";

type TicketFiltersProps = {
  searchInput: string;
  onSearchChange: (value: string) => void;

  status: string;
  onStatusChange: (value: string) => void;

  priority: string;
  onPriorityChange: (value: string) => void;

  category: string;
  onCategoryChange: (value: string) => void;

  triageDecision: string;
  onTriageDecisionChange: (value: string) => void;

  onClear: () => void;
};

const categories = [
  "billing",
  "technical",
  "account",
  "shipping",
  "refund",
  "urgent_billing",
];

const inputClasses =
  "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition hover:border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10";

const labelClasses =
  "mb-2 block text-xs font-semibold text-slate-600";

export function TicketFilters({
  searchInput,
  onSearchChange,
  status,
  onStatusChange,
  priority,
  onPriorityChange,
  category,
  onCategoryChange,
  triageDecision,
  onTriageDecisionChange,
  onClear,
}: TicketFiltersProps) {
  return (
    <section className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-4 py-3.5 sm:px-5 sm:py-4">
        <h2 className="font-semibold text-slate-900">
          Find tickets
        </h2>
        <p className="mt-1 text-xs text-slate-500 sm:text-sm">
          Narrow the list using keywords and ticket attributes.
        </p>
      </div>

      <div className="grid gap-3.5 p-4 sm:gap-4 sm:p-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <div className="xl:col-span-2">
          <label className={labelClasses} htmlFor="ticket-search">
            Search
          </label>
          <input
            id="ticket-search"
            type="search"
            value={searchInput}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Subject, customer or ID..."
            className={inputClasses}
          />
        </div>

        <div>
          <label className={labelClasses} htmlFor="ticket-status">
            Status
          </label>
          <select
            id="ticket-status"
            value={status}
            onChange={(event) => onStatusChange(event.target.value)}
            className={inputClasses}
          >
            <option value="">All statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        <div>
          <label className={labelClasses} htmlFor="ticket-priority">
            Priority
          </label>
          <select
            id="ticket-priority"
            value={priority}
            onChange={(event) => onPriorityChange(event.target.value)}
            className={inputClasses}
          >
            <option value="">All priorities</option>
            <option value="P0">P0 — Critical</option>
            <option value="P1">P1 — High</option>
            <option value="P2">P2 — Medium</option>
            <option value="P3">P3 — Low</option>
          </select>
        </div>

        <div>
          <label className={labelClasses} htmlFor="ticket-category">
            Category
          </label>
          <select
            id="ticket-category"
            value={category}
            onChange={(event) => onCategoryChange(event.target.value)}
            className={inputClasses}
          >
            <option value="">All categories</option>
            {categories.map((item) => (
              <option key={item} value={item}>
                {item.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClasses} htmlFor="ticket-triage">
            AI decision
          </label>
          <select
            id="ticket-triage"
            value={triageDecision}
            onChange={(event) => onTriageDecisionChange(event.target.value)}
            className={inputClasses}
          >
            <option value="">All decisions</option>
            <option value="auto_accept">Auto accept</option>
            <option value="manual_review">Manual review</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-2.5 border-t border-slate-100 bg-slate-50/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <p className="text-xs text-slate-500">
          Use the filters above to narrow your ticket list.
        </p>

        <button
          type="button"
          onClick={onClear}
          className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 sm:w-auto"
        >
          Clear filters
        </button>
      </div>
    </section>
  );
}