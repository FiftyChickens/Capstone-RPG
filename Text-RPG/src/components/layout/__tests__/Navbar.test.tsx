import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import { Navbar } from "@/components/layout/NavBar"; // Adjust the import path
import { useAuth } from "@/context/AuthContext"; // Import useAuth

// Mock useAuth
jest.mock("@/context/AuthContext", () => ({
  useAuth: jest.fn(), // Mock useAuth as a Jest function
}));

describe("Navbar", () => {
  it("should call logout when the logout button is clicked", () => {
    // Create a mock logout function
    const mockLogout = jest.fn();

    // Mock useAuth to return the mock logout function
    (useAuth as jest.Mock).mockReturnValue({
      isLoggedIn: true,
      logout: mockLogout, // Inject the mock logout function
      login: jest.fn(),
    });

    // Render the Navbar component
    render(<Navbar />);

    // Find the logout button and click it
    const logoutButton = screen.getByText("Logout");
    fireEvent.click(logoutButton);

    // Verify that the logout function was called
    expect(mockLogout).toHaveBeenCalled();
  });
});
