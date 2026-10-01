import { configureStore } from "@reduxjs/toolkit";

import agentReducer from "./agentSlice";
import ticketReducer from "./ticketSlice";
import ticketFilterReducer from "./ticketFilterSlice";
import timeReducer from "./timeSlice";

export const store = configureStore({
  reducer: {
    agent: agentReducer,
    tickets: ticketReducer,
    ticketFilters: ticketFilterReducer,
    time: timeReducer,
  },
});

export type RootState = ReturnType<
  typeof store.getState
>;

export type AppDispatch =
  typeof store.dispatch;