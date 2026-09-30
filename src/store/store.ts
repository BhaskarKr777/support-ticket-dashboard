import { configureStore } from "@reduxjs/toolkit";

import agentReducer from "./agentSlice";
import ticketReducer from "./ticketSlice";

export const store = configureStore({
  reducer: {
    agent: agentReducer,
    tickets: ticketReducer,
  },
});

export type RootState = ReturnType<
  typeof store.getState
>;

export type AppDispatch = typeof store.dispatch;