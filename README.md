# Support Ticket Dashboard

This project is my submission for the Frontend Developer internship assignment.

The goal is to build a support dashboard where agents can view tickets, search and filter them, claim tickets, update their status, and review AI triage decisions.

## Tech Stack

- Next.js with App Router
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Redux Toolkit

## What the project covers

The dashboard is being built around the requirements given in the assignment.

The main parts are:

- Ticket list with search and filters
- Ticket details
- Ticket claiming
- Ticket status changes
- AI review queue
- Re-running AI triage
- Live ticket updates
- Bulk actions
- Agent selection
- Ticket deadline tracking
- Responsive layout

The backend is a small fake API built inside the Next.js application using Route Handlers. Ticket data is kept in memory as required by the assignment.

## Development Phases

### Phase 0 — Project Foundation

- [x] Review assignment requirements
- [x] Identify unclear and conflicting requirements
- [x] Decide project architecture
- [x] Create Next.js project
- [x] Set up TypeScript and App Router
- [x] Set up Tailwind CSS and shadcn/ui
- [x] Set up Redux Toolkit
- [x] Create initial project documentation

### Phase 1 — Fake API and Data Foundation

- [x] Create ticket types
- [x] Add assignment-provided test tickets
- [x] Generate approximately 5,000 tickets
- [x] Create in-memory ticket store
- [x] Create ticket listing API
- [x] Add pagination
- [x] Add search by subject and body
- [x] Add status, priority, category and AI decision filters
- [x] Add simulated API latency
- [x] Add simulated API failures
- [x] Create ticket details API
- [x] Create claim API
- [x] Add claim conflict handling
- [x] Create status update API
- [x] Validate allowed status transitions
- [x] Create triage update API
- [x] Validate triage changes and review reasons
- [x] Enforce Enterprise priority rules server-side
- [x] Validate agent IDs server-side
- [x] Create re-triage API
- [x] Keep the triage API key server-side
- [x] Create live update history
- [x] Create `/api/tickets/updates?since=`
- [x] Add simulated live ticket activity every 5–10 seconds
- [x] Test intentionally invalid API inputs

### Phase 2 — App Shell and Shared State

- [x] Create dashboard layout
- [x] Create header and navigation
- [x] Set up Redux store
- [x] Add shared agent selection
- [x] Add agent dropdown
- [x] Persist selected agent
- [x] Add My Tickets count
- [x] Add To Review count

### Phase 3 — Ticket List

- [x] Build ticket list page
- [x] Add ticket table/list structure
- [x] Add search input
- [x] Debounce search
- [x] Add status filter
- [x] Add priority filter
- [x] Add category filter
- [x] Add AI decision filter
- [x] Persist filters in Redux
- [x] Sync filters with the URL
- [x] Add loading state
- [x] Add empty state
- [x] Add error and retry state
- [x] Add deadline countdown
- [x] Add on-track, at-risk and late states
- [x] Handle large ticket lists
- [x] Make the list responsive
- [x] Support continuous scrolling through paginated API results
- [x] Prevent duplicate tickets when loading additional pages
- [x] Verify 375px mobile layout

### Phase 4 — Ticket Details

- [ ] Build ticket details page
- [ ] Display customer and ticket information
- [ ] Display AI summary and decision
- [ ] Show AI priority vs final priority when different
- [ ] Safely render customer-provided HTML
- [ ] Validate attachment URLs
- [ ] Add optimistic ticket claiming
- [ ] Roll back failed claims
- [ ] Prevent duplicate requests
- [ ] Add status changes
- [ ] Handle another agent claiming a ticket
- [ ] Add re-run AI action
- [ ] Add proper not-found handling

### Phase 5 — AI Review Queue

- [ ] Build `/review`
- [ ] Show tickets requiring manual review
- [ ] Display AI category, priority, summary and reason
- [ ] Add Accept AI action
- [ ] Add category changes
- [ ] Add priority changes
- [ ] Require a reason for manual changes
- [ ] Validate review input
- [ ] Enforce Enterprise priority rules
- [ ] Remove handled tickets from the review queue

### Phase 6 — Live Updates and Bulk Actions

- [ ] Add polling for live ticket updates
- [ ] Document polling frequency and reasoning
- [ ] Prevent new tickets from unexpectedly jumping into the list
- [ ] Add "new tickets" notification
- [ ] Handle new arrivals without duplicates or skipped tickets
- [ ] Add multi-ticket selection
- [ ] Add bulk claim
- [ ] Add bulk status changes
- [ ] Handle partial success and failure
- [ ] Show per-ticket results
- [ ] Keep successful changes
- [ ] Allow undo for failed operations

### Phase 7 — Testing, Performance and Final Review

- [ ] Add meaningful automated tests
- [ ] Keep tests independent from random fake API failures
- [ ] Test tricky ticket cases
- [ ] Check loading, failure and mutation states
- [ ] Check customer-provided content safety
- [ ] Check server-side validation
- [ ] Optimize unnecessary row re-renders
- [ ] Check search performance
- [ ] Run production build
- [ ] Run Lighthouse on mobile
- [ ] Capture Lighthouse screenshot
- [x] Test at 375px width
- [x] Update README
- [ ] Complete DECISIONS.md
- [ ] Final walkthrough and cleanup

## Current Status

Phase 0, Phase 1, Phase 2 and Phase 3 are complete.

The current implementation includes the fake API, generated ticket dataset, Redux state, agent selection, ticket statistics, ticket filtering/search, URL-persisted filters, pagination with continuous scrolling, and live SLA countdowns.

The next phase focuses on the individual ticket page, claiming, status changes, optimistic updates, and customer-controlled content security.

## Getting Started

Clone the repository and install the dependencies:

```bash
npm install