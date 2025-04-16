import { render, screen, fireEvent } from "@testing-library/react";
import Home from "@/app/page";
import "@testing-library/jest-dom";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

// Mock the Button component
jest.mock("@/components/ui/Button", () => {
  return {
    __esModule: true,
    default: ({
      onClick,
      children,
    }: {
      onClick: () => void;
      children: React.ReactNode;
    }) => <button onClick={onClick}>{children}</button>,
  };
});

// Mock the useRouter and useAuth hooks
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("@/context/AuthContext", () => ({
  useAuth: jest.fn(),
}));

describe("Home", () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should render the welcome message and description", () => {
    // Mock unauthenticated user
    (useAuth as jest.Mock).mockReturnValue({
      isLoggedIn: false,
    });

    render(<Home />);

    expect(
      screen.getByText("Welcome to Dragon Slayer (text RPG)")
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /A dragon has risen, casting a shadow of fear across the land/
      )
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Yes" })).toBeInTheDocument();
  });

  it("should redirect to dashboard when user is logged in", () => {
    // Mock authenticated user
    (useAuth as jest.Mock).mockReturnValue({
      isLoggedIn: true,
    });

    render(<Home />);
    fireEvent.click(screen.getByRole("button", { name: "Yes" }));

    expect(mockPush).toHaveBeenCalledWith("/dashboard");
  });

  it("should redirect to login when user is not logged in", () => {
    // Mock unauthenticated user
    (useAuth as jest.Mock).mockReturnValue({
      isLoggedIn: false,
    });

    render(<Home />);
    fireEvent.click(screen.getByRole("button", { name: "Yes" }));

    expect(mockPush).toHaveBeenCalledWith("/login");
  });
});
