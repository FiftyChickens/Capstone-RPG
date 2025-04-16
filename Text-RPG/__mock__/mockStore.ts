// __tests__/mockStore.ts
import { configureStore } from "@reduxjs/toolkit";
import buttonReducer from "@/features/buttonSlice"; // Adjust the import path
import { RootState } from "@/features/store"; // Adjust the import path

export const createMockStore = (preloadedState?: Partial<RootState>) => {
  return configureStore({
    reducer: {
      button: buttonReducer, // Add other reducers if needed
    },
    preloadedState: preloadedState as RootState, // Cast to RootState to satisfy TypeScript
  });
};
