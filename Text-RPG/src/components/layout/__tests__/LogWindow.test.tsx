// __tests__/LogWindow.test.tsx
import { render, screen } from "@testing-library/react";
import LogWindow from "@/components/layout/LogWindow"; // Adjust the import path
import "@testing-library/jest-dom";

describe("LogWindow", () => {
  const mockLogs = ["Log 1", "Log 2", "Log 3"];

  it("should render logs in reverse order", () => {
    render(<LogWindow logs={mockLogs} />);

    expect(screen.getByText("Log 3")).toBeInTheDocument();
    expect(screen.getByText("Log 2")).toBeInTheDocument();
    expect(screen.getByText("Log 1")).toBeInTheDocument();
  });
});
