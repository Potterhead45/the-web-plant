import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface ToastNotification {
  id: string;
  type: "success" | "error" | "info";
  message: string;
}

interface UiState {
  notifications: ToastNotification[];
}

const initialState: UiState = {
  notifications: [],
};

export const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    addNotification: (
      state,
      action: PayloadAction<{ type: "success" | "error" | "info"; message: string }>
    ) => {
      const id = Date.now().toString() + Math.random().toString(36).substring(2, 6);
      state.notifications.push({
        id,
        type: action.payload.type,
        message: action.payload.message,
      });
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter((n) => n.id !== action.payload);
    },
  },
});

export const { addNotification, removeNotification } = uiSlice.actions;
export default uiSlice.reducer;
