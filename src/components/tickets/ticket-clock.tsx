"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";

import type { AppDispatch } from "@/store/store";

import { updateTime } from "@/store/timeSlice";

export function TicketClock() {
  const dispatch =
    useDispatch<AppDispatch>();

  useEffect(() => {
    const interval = setInterval(() => {
      dispatch(updateTime());
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [dispatch]);

  return null;
}