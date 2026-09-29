# Support Ticket Dashboard

This project is my submission for the Frontend Developer internship assignment.

The goal is to build a support dashboard where agents can view tickets, search
and filter them, claim tickets, update their status, and review AI triage
decisions.

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

The backend is a small fake API built inside the Next.js application using
Route Handlers. Ticket data is kept in memory as required by the assignment.

## Getting Started

Clone the repository and install the dependencies:

```bash
npm install