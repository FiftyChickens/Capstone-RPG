import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ReduxProvider from "@/context/ReduxProvider"; // Adjust the import path
import MerchantWindow from "@/components/layout/MerchantWindow"; // Adjust the import path
import axios from "axios";
import { JSX } from "react";

// Mock axios
jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Function to wrap the component with ReduxProvider
const renderWithRedux = (component: JSX.Element) => {
  return render(<ReduxProvider>{component}</ReduxProvider>);
};

describe("MerchantWindow", () => {
  const mockProps = {
    shopItems: [
      {
        _id: "1",
        itemId: {
          _id: "item1",
          name: "Sword",
          effect: "Increases damage by 5",
          type: "weapon",
          value: 10,
        },
        price: 50,
      },
    ],
    isMerchantOpen: jest.fn(),
    usersGold: 100,
    setUpdate: jest.fn(),
    setLogs: jest.fn(),
  };

  it("should render items for sale", () => {
    renderWithRedux(<MerchantWindow {...mockProps} />);

    expect(screen.getByText("Sword")).toBeInTheDocument();
    expect(screen.getByText("Buy")).toBeInTheDocument();
  });

  it("should handle purchasing an item", async () => {
    mockedAxios.post.mockResolvedValue({});
    mockedAxios.patch.mockResolvedValue({});

    renderWithRedux(<MerchantWindow {...mockProps} />);

    // Click the "Buy" button for the Sword
    fireEvent.click(screen.getByText("Buy"));

    // Verify the API calls were made
    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith("/api/dashboard/items", {
        itemIds: "item1",
      });
      expect(mockedAxios.patch).toHaveBeenCalledWith("/api/dashboard/user", {
        updateGold: -50,
      });
    });
  });
});
