import { createSlice } from "@reduxjs/toolkit";

interface TimeState {
  now: number;
}

const initialState: TimeState = {
  now: Date.now(),
};

const timeSlice = createSlice({
  name: "time",
  initialState,

  reducers: {
    updateTime(state) {
      state.now = Date.now();
    },
  },
});

export const { updateTime } =
  timeSlice.actions;

export default timeSlice.reducer;