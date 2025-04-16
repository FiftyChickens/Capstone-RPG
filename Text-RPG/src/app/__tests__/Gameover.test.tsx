import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import GameoverPage from "@/app/gameover/page";
import axios from "axios";
import { Provider } from "react-redux";
import { createMockStore } from "../../../__mock__/mockStore";

// Mock axios
jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock useRouter
const mockPush = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => "/gameover",
}));

// Mock console.error to track it
const mockConsoleError = jest
  .spyOn(console, "error")
  .mockImplementation(() => {});

describe("GameoverPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    mockConsoleError.mockRestore();
  });

  it("should call the API and redirect to /dashboard on button click", async () => {
    mockedAxios.post.mockResolvedValue({
      data: { message: "User data reset successfully" },
    });

    const mockStore = createMockStore({
      button: { isDisabled: false },
    });

    render(
      <Provider store={mockStore}>
        <GameoverPage />
      </Provider>
    );

    fireEvent.click(screen.getByText("Retry"));

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith("/api/dashboard/user");
      expect(mockPush).toHaveBeenCalledWith("/dashboard");
      expect(mockConsoleError).not.toHaveBeenCalled();
    });
  });

  it("should handle API errors, log them, and still redirect", async () => {
    const apiError = new Error("API Error");
    mockedAxios.post.mockRejectedValue(apiError);

    const mockStore = createMockStore({
      button: { isDisabled: false },
    });

    render(
      <Provider store={mockStore}>
        <GameoverPage />
      </Provider>
    );

    fireEvent.click(screen.getByText("Retry"));

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith("/api/dashboard/user");
      expect(mockPush).toHaveBeenCalledWith("/dashboard");
      expect(mockConsoleError).toHaveBeenCalledWith(
        "Error resetting user data:",
        apiError
      );
    });
  });
});
