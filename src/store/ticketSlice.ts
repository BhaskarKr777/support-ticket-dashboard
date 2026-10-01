import {
  createAsyncThunk,
  createSlice,
} from "@reduxjs/toolkit";

import type { Ticket } from "@/types/ticket";

const PAGE_SIZE = 100;

export interface TicketQuery {
  search?: string;
  status?: string;
  priority?: string;
  category?: string;
  triageDecision?: string;
}

interface TicketResponse {
  tickets: Ticket[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface TicketState {
  tickets: Ticket[];
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  page: number;
  totalPages: number;
  total: number;
}

const initialState: TicketState = {
  tickets: [],
  loading: false,
  loadingMore: false,
  error: null,
  page: 0,
  totalPages: 0,
  total: 0,
};

function buildQuery(
  page: number,
  query: TicketQuery = {},
): string {
  const params = new URLSearchParams();

  params.set(
    "page",
    String(page),
  );

  params.set(
    "limit",
    String(PAGE_SIZE),
  );

  if (query.search) {
    params.set(
      "search",
      query.search,
    );
  }

  if (query.status) {
    params.set(
      "status",
      query.status,
    );
  }

  if (query.priority) {
    params.set(
      "priority",
      query.priority,
    );
  }

  if (query.category) {
    params.set(
      "category",
      query.category,
    );
  }

  if (query.triageDecision) {
    params.set(
      "triage_decision",
      query.triageDecision,
    );
  }

  return params.toString();
}

interface FetchTicketsArgs {
  page?: number;
  append?: boolean;
  query?: TicketQuery;
}

export const fetchTickets =
  createAsyncThunk<
    TicketResponse,
    FetchTicketsArgs | undefined,
    { rejectValue: string }
  >(
    "tickets/fetchTickets",
    async (
      {
        page = 1,
        query = {},
      } = {},
      { rejectWithValue },
    ) => {
      try {
        const queryString =
          buildQuery(
            page,
            query,
          );

        const response =
          await fetch(
            `/api/tickets?${queryString}`,
          );

        if (!response.ok) {
          throw new Error(
            "Failed to fetch tickets",
          );
        }

        return await response.json();
      } catch {
        return rejectWithValue(
          "Unable to load tickets",
        );
      }
    },
  );

const ticketSlice =
  createSlice({
    name: "tickets",
    initialState,
    reducers: {
      clearTickets(state) {
        state.tickets = [];
        state.page = 0;
        state.totalPages = 0;
        state.total = 0;
        state.error = null;
      },
    },

    extraReducers: (builder) => {
      builder

        .addCase(
          fetchTickets.pending,
          (state, action) => {
            const isAppend =
              action.meta.arg?.append ??
              false;

            if (isAppend) {
              state.loadingMore = true;
            } else {
              state.loading = true;
            }

            state.error = null;
          },
        )

        .addCase(
          fetchTickets.fulfilled,
          (state, action) => {
            if (
              action.meta.arg?.append
            ) {
              const existingIds =
                new Set(
                  state.tickets.map(
                    (ticket) =>
                      ticket.id,
                  ),
                );

              const newTickets =
                action.payload.tickets.filter(
                  (ticket) =>
                    !existingIds.has(
                      ticket.id,
                    ),
                );

              state.tickets.push(
                ...newTickets,
              );

              state.loadingMore = false;
            } else {
              state.tickets =
                action.payload.tickets;

              state.loading = false;
            }

            state.page =
              action.payload.page;

            state.totalPages =
              action.payload.totalPages;

            state.total =
              action.payload.total;
          },
        )

        .addCase(
          fetchTickets.rejected,
          (state, action) => {
            const isAppend =
              action.meta.arg?.append ??
              false;

            if (isAppend) {
              state.loadingMore = false;
            } else {
              state.loading = false;
            }

            state.error =
              action.payload ??
              "Unable to load tickets";
          },
        );
    },
  });

export const {
  clearTickets,
} = ticketSlice.actions;

export default ticketSlice.reducer;