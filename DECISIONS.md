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

