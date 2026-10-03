# Decisions

## NEXT_PUBLIC_TRIAGE_API_KEY

The assignment mentions using `NEXT_PUBLIC_TRIAGE_API_KEY` for the "Re-run AI" action on the ticket page.

However, in the "How we judge" section, it is mentioned that secrets should be kept out of the browser.

These two requirements conflict because `NEXT_PUBLIC_` variables are exposed to the browser.

I decided to keep the API key server-side and use a Next.js API route for the re-triage request instead of exposing the key to the client.

## Test JSON cleanup

The test data provided in the assignment had several formatting issues after extracting it from the PDF. Since the deadline was limited, I used AI to help clean and validate the JSON while keeping the original test cases and intentionally invalid values unchanged.

The issues included: duplicate `external_id` (T-2001), invalid priority `P5` (T-2004), invalid agent `agent-99` (T-2009), unsupported status `closed` (T-2010), invalid AI decision `maybe` (T-2012), unsafe HTML/script content (T-2002, T-2011), unsafe `javascript:` attachment URL (T-2003), and formatting/line-break issues caused by PDF extraction.

## API validation and data ownership

The API is treated as the source of truth for ticket mutations. Rules such as valid agents, allowed status transitions, and the Enterprise priority requirement are enforced server-side instead of relying only on the UI.

The test data is kept unchanged, including intentionally invalid values. An internal ticket `id` is added because `external_id` is not guaranteed to be unique.

The ticket API remains paginated even though the UI is expected to display tickets as one continuous list. The frontend will fetch and merge pages rather than removing pagination from the API.

## Phase 1 audit and fixes

During the Phase 1 implementation, a few requirements were initially missed and were caught during an audit against the assignment.

The ticket search initially covered the subject and identifiers but not the ticket body. Body search was added so the API searches both subject and body as required.

The triage API initially allowed category or priority changes without requiring a reason. This was updated so changes require a written reason of at least 10 characters.

The live updates endpoint was implemented first with update history, but the required simulated activity was initially missing. A server-side simulator was added to generate activity every 5–10 seconds, including new tickets and ticket updates. These changes are recorded in the update history and exposed through `/api/tickets/updates?since=`.

The API was also checked against the intentionally invalid test cases. Invalid priority `P5` and invalid agent `agent-99` are rejected by the API rather than being handled only by the UI.

## Ticket list performance

Initially, the ticket list loaded and rendered all 5,000 tickets at the same time.

This caused noticeable lag because the browser had to process and render thousands of table rows at once.

This was identified during manual testing with the 5,000-ticket dataset.

To improve performance, the API is limited to a maximum of 100 tickets per request. The frontend initially loads 100 tickets and loads additional pages as the user scrolls.

This keeps the API paginated and reduces the amount of data rendered at one time while still allowing the UI to behave like one continuous ticket list.

## Customer-controlled content

Ticket subjects, bodies, AI summaries and attachment URLs are treated as untrusted input.

Customer-provided HTML is sanitized before rendering, and unsafe attachment URLs such as `javascript:` are blocked instead of being rendered as clickable links.

This was done specifically to handle the intentionally unsafe test cases in the assignment without allowing customer-controlled content to execute code in the dashboard.

## Phase 5 — AI Review Queue

For Phase 5, I built the `/review` page to give agents a dedicated space to check tickets where the AI model suggested `manual_review`.

When viewing the queue, agents can see the AI's category, priority, summary, and reason for flagging the ticket. If the AI got it right, clicking "Accept AI" immediately updates the decision to `auto_accept` and removes the ticket from the review queue.

If an agent needs to override the category or priority, I made it mandatory to enter a reason of at least 10 characters before submitting. I also ensured that Enterprise tier tickets cannot be downgraded below `P1` (allowing only `P0` or `P1`), which is enforced both in the form validation and on the server.

## Typography and Styling Refinements

To make the dashboard look cleaner and more modern, I switched the primary font family across the entire app to **Manrope** using `next/font/google`.

I also ran into an issue where dark primary buttons rendered text in an unreadable dark color. This happened because unlayered global reset styles (`button { color: inherit; }`) were taking precedence over Tailwind utility classes. I fixed this by wrapping the default HTML resets inside `@layer base` in `globals.css` so utility classes like `text-white` function properly.

## Mobile Responsiveness Improvements

While testing on smaller screens, I noticed several areas that needed better touch support and responsive layouts:

- The top header navigation was prone to crowding on small mobile devices, so I updated it to wrap neatly without horizontal scroll clipping.
- Viewing a 1100px wide table on a phone screen can be clumsy, so I created an adaptive card layout for mobile viewports while keeping the full data table for tablet and desktop screens.
- On ticket detail pages, action buttons now stretch to full width on mobile screens to serve as comfortable touch targets.

## Live Updates Strategy (10-second Polling)

For live updates, I chose to poll `/api/tickets/updates?since=<timestamp>` every 10 seconds.

Picked 10 seconds because the server-side update simulator generates or modifies tickets every 5 to 10 seconds. Polling every 10 seconds provides prompt updates while avoiding unnecessary network traffic.

To prevent the list from jumping unexpectedly while an agent is reading or clicking a row, newly arrived tickets are held in a pending state rather than immediately shifting the UI. A banner appears at the top ("N new tickets arrived — Show new tickets"). When clicked, the new tickets prepend smoothly to the top of the list.

If a live update modifies an existing visible ticket (such as a status change or claim by another agent), the specific row is updated in Redux without shifting scroll position.

## Bulk Actions and Partial Failure Handling

For bulk operations (Bulk Claim and Bulk Status Change), each selected ticket is sent as an independent API request using `Promise.allSettled`.

I chose this approach because in a real-world multi-agent environment, some claims or status updates may succeed while others fail due to conflicts (such as HTTP 409 when another agent claims a ticket first).

When a bulk action completes:
- Successful operations update state immediately.
- A per-ticket results modal breaks down exact outcomes for each ticket with green checkmarks or red failure explanations.
- Agents can click "Retry Failed" to re-attempt only the failed items without affecting already succeeded tickets.

## Automated Testing Strategy (Vitest)

For Phase 7, I set up Vitest and built an automated test suite with 9 unit tests across 3 targeted test files:

1. `sla-deadline.test.ts`: Verifies exact SLA hour calculations for P0–P3 priorities and tests `late`, `at_risk`, and `on_track` countdown states.
2. `content-sanitization.test.ts`: Verifies that XSS script tags and `onerror` handlers are stripped out of customer bodies, while safe HTML tags are preserved. Also verifies that `javascript:` attachment URLs are flagged as unsafe.
3. `triage-rules.test.ts`: Verifies business logic rules like Enterprise priority constraints (P0/P1 only), 10-character minimum review reason validation, and valid status transitions (`open` -> `in_progress` -> `resolved`).

All tests are completely deterministic and isolated from simulated network latency or random server failures.


