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

- [ ] Create dashboard layout
- [ ] Create header and navigation
- [ ] Set up Redux store
- [ ] Add shared agent selection
- [ ] Add agent dropdown
- [ ] Persist selected agent
- [ ] Add My Tickets count
- [ ] Add To Review count

### Phase 3 — Ticket List

- [ ] Build ticket list page
- [ ] Add ticket table/list structure
- [ ] Add search input
- [ ] Debounce search
- [ ] Add status filter
- [ ] Add priority filter
- [ ] Add category filter
- [ ] Add AI decision filter
- [ ] Persist filters in Redux
- [ ] Sync filters with the URL
- [ ] Add loading state
- [ ] Add empty state
- [ ] Add error and retry state
- [ ] Add deadline countdown
- [ ] Add on-track, at-risk and late states
- [ ] Handle large ticket lists
- [ ] Make the list responsive

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
- [ ] Test at 375px width
- [ ] Complete README
- [ ] Complete DECISIONS.md
- [ ] Final walkthrough and cleanup

## Getting Started

Clone the repository and install the dependencies:

```bash
npm install