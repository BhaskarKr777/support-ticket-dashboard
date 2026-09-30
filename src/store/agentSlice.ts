import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { Agent } from "@/types/ticket";

const agents: Agent[] = [
  {
    id: "agent-1",
    name: "Priya",
  },
  {
    id: "agent-2",
    name: "Rahul",
  },
  {
    id: "agent-3",
    name: "Meera",
  },
];

interface AgentState {
  agents: Agent[];
  currentAgentId: string;
}

const initialState: AgentState = {
  agents,
  currentAgentId: "agent-1",
};

const agentSlice = createSlice({
  name: "agent",
  initialState,
  reducers: {
    setCurrentAgent: (
      state,
      action: PayloadAction<string>,
    ) => {
      state.currentAgentId = action.payload;
    },
  },
});

export const { setCurrentAgent } = agentSlice.actions;

export function loadSavedAgent(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem("currentAgentId");
}

export function saveAgent(agentId: string): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem("currentAgentId", agentId);
}

export default agentSlice.reducer;