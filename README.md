# Support Ticket Dashboard

This project is my submission for the Frontend Developer internship assignment.

The goal is to build a support dashboard where agents can manage customer tickets, search and filter requests, claim tickets, update statuses, and review AI-generated triage decisions.

**Live Demo:** https://support-ticket-dashboard-five-ochre.vercel.app/tickets

**GitHub Repository:** [Support Ticket Dashboard](https://github.com/BhaskarKr777/support-ticket-dashboard)

## Tech Stack

* Next.js with App Router
* React
* TypeScript
* Tailwind CSS
* shadcn/ui
* Redux Toolkit
* Next.js Route Handlers for the fake API

## Features Implemented

### Dashboard and Navigation

* Shared dashboard layout and navigation
* Agent selection with local persistence
* My Tickets and To Review counts
* Ticket statistics based on the selected agent and review status

### Ticket List

* Search tickets by relevant ticket content
* Filter by status, priority, category, and AI triage decision
* Debounced search to reduce unnecessary API requests
* Synchronize filters with URL query parameters
* Paginated API with continuous scrolling
* Prevent duplicate tickets when loading additional pages
* Loading, error, retry, and empty states
* SLA deadline countdowns with on-track, at-risk, and late states
* Responsive layout, including support for a 375px mobile viewport

### Ticket Details

* Display ticket, customer, and AI triage information
* Compare AI-assigned priority with the final priority
* Claim tickets with optimistic UI updates and rollback on failure
* Handle claim conflicts
* Update ticket status with server-side transition validation
* Re-run AI triage through a server-side API proxy
* Safely render customer-provided HTML
* Block unsafe attachment URLs
* Handle missing tickets and API errors

### Fake API and Data

* In-memory ticket store
* Approximately 5,000 generated tickets
* Assignment-provided test tickets
* Simulated API latency and request failures
* Claim conflict simulation
* Server-side validation for ticket mutations
* Ticket update history and simulated live activity
* Server-side triage API key handling

## Development Phases

### Phase 0 — Project Foundation

* [x] Review assignment requirements
* [x] Identify unclear and conflicting requirements
* [x] Decide project architecture
* [x] Create Next.js project
* [x] Set up TypeScript and App Router
* [x] Set up Tailwind CSS and shadcn/ui
* [x] Set up Redux Toolkit
* [x] Create initial project documentation

### Phase 1 — Fake API and Data Foundation

* [x] Create ticket types and test data
* [x] Generate approximately 5,000 tickets
* [x] Create the in-memory ticket store
* [x] Create ticket listing and details APIs
* [x] Add pagination, search, and filters
* [x] Add simulated latency and failures
* [x] Create ticket claim and status update APIs
* [x] Validate allowed status transitions
* [x] Handle claim conflicts
* [x] Create triage update and re-triage APIs
* [x] Validate triage changes and review reasons
* [x] Enforce Enterprise priority rules server-side
* [x] Validate agent IDs server-side
* [x] Keep the triage API key server-side
* [x] Create ticket update history
* [x] Create the live updates endpoint
* [x] Add simulated ticket activity
* [x] Test intentionally invalid API inputs

### Phase 2 — App Shell and Shared State

* [x] Create dashboard layout
* [x] Create header and navigation
* [x] Configure the Redux store
* [x] Add shared agent selection
* [x] Add agent dropdown and persistence
* [x] Display My Tickets count
* [x] Display To Review count

### Phase 3 — Ticket List

* [x] Build the ticket list page
* [x] Add search and filters
* [x] Debounce search
* [x] Synchronize filters with the URL
* [x] Add loading, empty, error, and retry states
* [x] Add SLA deadline countdowns
* [x] Handle large ticket lists through pagination
* [x] Implement continuous scrolling
* [x] Prevent duplicate tickets across pages
* [x] Make the list responsive
* [x] Verify the 375px mobile layout

### Phase 4 — Ticket Details

* [x] Build the ticket details page
* [x] Display customer and ticket information
* [x] Display AI summary and triage decision
* [x] Show AI priority versus final priority when different
* [x] Safely render customer-provided HTML
* [x] Validate attachment URLs
* [x] Implement optimistic ticket claiming
* [x] Roll back failed claims
* [x] Handle claim conflicts
* [x] Add ticket status changes
* [x] Prevent duplicate mutation requests
* [x] Add the re-run AI action
* [x] Keep the triage API key server-side
* [x] Handle missing tickets and API errors

### Phase 5 — AI Review Queue

* [x] Build the `/review` page
* [x] Display tickets requiring manual review
* [x] Show AI category, priority, summary, and review reason
* [x] Add the Accept AI action
* [x] Allow category and priority changes
* [x] Require a reason for manual changes
* [x] Validate review input
* [x] Enforce Enterprise priority rules
* [x] Remove handled tickets from the review queue

### Phase 6 — Live Updates and Bulk Actions

* [ ] Add polling for live ticket updates
* [ ] Document the polling frequency and reasoning
* [ ] Prevent new tickets from unexpectedly jumping into the list
* [ ] Add a notification for new tickets
* [ ] Handle new arrivals without duplicates or skipped updates
* [ ] Add multi-ticket selection
* [ ] Implement bulk claim
* [ ] Implement bulk status changes
* [ ] Handle partial successes and failures
* [ ] Show per-ticket operation results
* [ ] Preserve successful changes
* [ ] Support undo or recovery for failed operations

### Phase 7 — Testing, Performance, and Final Review

* [ ] Add meaningful automated tests
* [ ] Keep tests independent of random fake API failures
* [ ] Test the assignment's tricky ticket cases
* [ ] Check loading, error, and mutation states
* [ ] Verify customer-content safety
* [ ] Verify server-side validation
* [ ] Optimize unnecessary row re-renders
* [ ] Check search performance
* [ ] Run the production build
* [ ] Run Lighthouse on mobile
* [ ] Capture a Lighthouse screenshot
* [x] Verify the 375px mobile layout
* [ ] Complete `DECISIONS.md`
* [ ] Perform a final walkthrough and cleanup

## Current Status

**Completed:** Phases 0–5

The project currently includes the dashboard shell, shared agent selection, ticket statistics, a searchable and filterable ticket list, URL-synchronized filters, paginated loading, SLA countdowns, ticket details, optimistic claiming, status updates, AI triage information, safe customer-content rendering, the re-run AI action, and the complete AI Review Queue (`/review`) with manual review overrides, validation, and Enterprise SLA protection.

The next phase is Phase 6: Live Updates and Bulk Actions. Live updates, bulk actions, automated testing, performance checks, and final deployment-related verification remain on the roadmap.

The current deployment is planned at the end of Phase 4 so that a working version can be shared while the remaining features are developed.

## Getting Started

### Prerequisites

* Node.js and npm
* Git

### Installation

Clone the repository:

```bash
git clone https://github.com/BhaskarKr777/support-ticket-dashboard.git
cd support-ticket-dashboard
```

Install dependencies:

```bash
npm install
```

### Environment Variables

Create a `.env.local` file in the project root:

```env
TRIAGE_API_KEY=your-test-key
```

Use the test key expected by your local fake triage integration. Keep this variable server-side. Do not rename it to `NEXT_PUBLIC_TRIAGE_API_KEY` or expose its value in client-side code.

Do not commit `.env.local` or real secrets to GitHub.

### Run the Development Server

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

### Useful Commands

```bash
# Start the development server
npm run dev

# Run ESLint
npm run lint

# Check TypeScript types
npx tsc --noEmit

# Create a production build
npm run build
```

## Main Routes

| Route           | Description                                  |
| --------------- | -------------------------------------------- |
| `/tickets`      | Ticket list, search, filters, and pagination |
| `/tickets/[id]` | Ticket details and available actions         |
| `/review`       | AI review queue (Phase 5)                    |

## API Endpoints

| Method  | Endpoint                           | Purpose                                    |
| ------- | ---------------------------------- | ------------------------------------------ |
| `GET`   | `/api/tickets`                     | List, search, filter, and paginate tickets |
| `GET`   | `/api/tickets/[id]`                | Retrieve ticket details                    |
| `POST`  | `/api/tickets/[id]/claim`          | Claim a ticket                             |
| `PATCH` | `/api/tickets/[id]/status`         | Update ticket status                       |
| `PATCH` | `/api/tickets/[id]/triage`         | Update triage information                  |
| `POST`  | `/api/tickets/[id]/retriage`       | Re-run AI triage                           |
| `POST`  | `/api/tickets/[id]/retriage-proxy` | Server-side proxy for re-triage            |
| `GET`   | `/api/tickets/stats`               | Retrieve agent and review statistics       |
| `GET`   | `/api/tickets/updates?since=`      | Retrieve ticket updates since a timestamp  |

The fake API simulates network latency and intermittent failures to make the dashboard behave more like an application communicating with a remote service.

## Implementation Notes

* Ticket data is held in memory, so changes may reset when the server restarts.
* The fake API is intended for this assignment, not as a production backend.
* Redux Toolkit manages shared client state, including agent selection, ticket data, and filters.
* Ticket filtering is reflected in URL query parameters so filtered views can be shared.
* Customer-provided HTML is sanitized before rendering.
* Attachment URLs are checked before they are rendered as links.
* Sensitive triage configuration stays on the server.

## Project Structure

```text
src/
├── app/
│   ├── api/
│   │   └── tickets/
│   ├── tickets/
│   │   └── [id]/
│   ├── review/
│   └── ...
├── components/
│   ├── layout/
│   ├── tickets/
│   └── ui/
├── data/
├── lib/
├── store/
└── types/
```

## Design and Technical Decisions

Important implementation choices, trade-offs, and assignment-specific decisions are documented in [`DECISIONS.md`](./DECISIONS.md).

## Deployment

**Live application:** [Add deployed URL here]

The deployment will be updated as the remaining assignment phases are completed.

## Author

**Bhaskar Kumar**

B.Tech Computer Science and Engineering student, Siliguri Institute of Technology.
