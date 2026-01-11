import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AdminProfile } from "@/types/entities";

export interface AuthState {
  token: string | null;
  admin: AdminProfile | null;
  initialized: boolean;
}

const initialState: AuthState = {
  token: null,
  admin: null,
  initialized: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setToken(state, action: PayloadAction<string | null>) {
      state.token = action.payload;
    },
    setAdmin(state, action: PayloadAction<AdminProfile | null>) {
      state.admin = action.payload;
    },
    setInitialized(state, action: PayloadAction<boolean>) {
      state.initialized = action.payload;
    },
    resetAuth() {
      return initialState;
    },
  },
});

export const { setToken, setAdmin, setInitialized, resetAuth } =
  authSlice.actions;

export const authReducer = authSlice.reducer;
