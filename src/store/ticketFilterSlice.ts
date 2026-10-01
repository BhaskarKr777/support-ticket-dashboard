import {
  createSlice,
  PayloadAction,
} from "@reduxjs/toolkit";

export type TicketFilters = {
  search: string;
  status: string;
  priority: string;
  category: string;
  triageDecision: string;
};

const initialState: TicketFilters = {
  search: "",
  status: "",
  priority: "",
  category: "",
  triageDecision: "",
};

const ticketFilterSlice = createSlice({
  name: "ticketFilters",
  initialState,

  reducers: {
    setSearch(
      state,
      action: PayloadAction<string>,
    ) {
      state.search = action.payload;
    },

    setStatus(
      state,
      action: PayloadAction<string>,
    ) {
      state.status = action.payload;
    },

    setPriority(
      state,
      action: PayloadAction<string>,
    ) {
      state.priority = action.payload;
    },

    setCategory(
      state,
      action: PayloadAction<string>,
    ) {
      state.category = action.payload;
    },

    setTriageDecision(
      state,
      action: PayloadAction<string>,
    ) {
      state.triageDecision =
        action.payload;
    },

    clearFilters(state) {
      state.search = "";
      state.status = "";
      state.priority = "";
      state.category = "";
      state.triageDecision = "";
    },
  },
});

export const {
  setSearch,
  setStatus,
  setPriority,
  setCategory,
  setTriageDecision,
  clearFilters,
} = ticketFilterSlice.actions;

export default ticketFilterSlice.reducer;