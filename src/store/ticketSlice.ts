import {
  createAsyncThunk,
  createSlice,
} from "@reduxjs/toolkit";

import type { Ticket } from "@/types/ticket";

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
  error: string | null;
}

const initialState: TicketState = {
  tickets: [],
  loading: false,
  error: null,
};

export const fetchTickets = createAsyncThunk<
  Ticket[],
  void,
  { rejectValue: string }
>(
  "tickets/fetchTickets",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(
        "/api/tickets?limit=5000&page=1",
      );

      if (!response.ok) {
        throw new Error("Failed to fetch tickets");
      }

      const data: TicketResponse =
        await response.json();

      return data.tickets;
    } catch {
      return rejectWithValue(
        "Unable to load tickets",
      );
    }
  },
);

const ticketSlice = createSlice({
  name: "tickets",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTickets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(
        fetchTickets.fulfilled,
        (state, action) => {
          state.loading = false;
          state.tickets = action.payload;
        },
      )

      .addCase(
        fetchTickets.rejected,
        (state, action) => {
          state.loading = false;
          state.error =
            action.payload ??
            "Unable to load tickets";
        },
      );
  },
});

export default ticketSlice.reducer;