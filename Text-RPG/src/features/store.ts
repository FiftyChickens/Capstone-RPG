import { configureStore } from "@reduxjs/toolkit";
import buttonReducer from "./buttonSlice";

export const store = configureStore({
  reducer: {
    button: buttonReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
