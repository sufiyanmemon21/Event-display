import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authslices";

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});