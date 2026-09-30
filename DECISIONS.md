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