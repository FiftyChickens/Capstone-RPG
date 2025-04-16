"use client"; // Mark this as a Client Component

import { Provider } from "react-redux";
import { store } from "../features/store";

export default function ReduxProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Provider store={store}>{children}</Provider>;
}
