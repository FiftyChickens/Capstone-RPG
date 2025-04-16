import { render, screen, fireEvent } from "@testing-library/react";
import QuestInventoryWindow from "@/components/layout/QuestInventoryWindow";
import { Provider } from "react-redux";
import { createMockStore } from "../../../../__mock__/mockStore";

// Simplified mock data that matches the component's expected types
jest.mock("mongodb", () => ({
  ObjectId: jest.fn().mockImplementation((id = "mock-id") => ({
    toString: () => id,
    toHexString: () => id,
  })),
}));

const mockInventory = [
  {
    _id: "1",
    itemId: {
      _id: "item1", // Changed to string to match IItemId interface
      name: "Health Potion",
      type: "potion",
      effect: "Restores 20 health",
      value: 10,
    },
    quantity: 2,
    slot: 1,
  },
];

const mockActiveQuests = [
  {
    questId: {
      _id: Object("quest1"), // Changed to string to match IQuest interface
      name: "Test Quest",
      description: "Test description",
      objectives: {
        _id: Object("objective"),
        type: "defeat",
        target: Object("target1"), // Changed to string
        quantity: 1,
      },
      rewards: {
        _id: Object("reward1"),
        XP: 10,
        gold: 5,
        items: [],
      },
    },
    progress: 0,
  },
];

const mockUserLocation = {
  _id: "loc1", // Changed to string to match ILocation interface
  name: "Forest",
  description: "A dense forest",
  actions: [],
};

const baseProps = {
  setUpdate: jest.fn(),
  usersTurn: true,
  setUsersTurn: jest.fn(),
  enemy: undefined,
  setUserHealth: jest.fn(),
  userHealth: 100,
  userMaxHealth: 100,
  setLogs: jest.fn(),
  isMerchantWindowOpen: false,
  userLocation: mockUserLocation,
  actionId: undefined,
  onActionProcessed: jest.fn(),
  setEnemy: jest.fn(),
};

describe("QuestInventoryWindow Visibility", () => {
  it("should show inventory items when inventory view is active", () => {
    const mockStore = createMockStore();

    render(
      <Provider store={mockStore}>
        <QuestInventoryWindow
          {...baseProps}
          inventory={mockInventory}
          activeQuests={[]}
          completedQuests={[]}
        />
      </Provider>
    );

    // Click to show inventory (since initial state shows quests)
    fireEvent.click(screen.getByText("Show Inventory"));
    expect(screen.getByText("2 Health Potion")).toBeInTheDocument();
  });

  it("should show active quests when quest view is active", () => {
    const mockStore = createMockStore();

    render(
      <Provider store={mockStore}>
        <QuestInventoryWindow
          {...baseProps}
          inventory={[]}
          activeQuests={mockActiveQuests}
          completedQuests={[]}
        />
      </Provider>
    );

    expect(screen.getByText("Test Quest")).toBeInTheDocument();
  });

  it("should show empty state when no items or quests", () => {
    const mockStore = createMockStore();

    render(
      <Provider store={mockStore}>
        <QuestInventoryWindow
          {...baseProps}
          inventory={[]}
          activeQuests={[]}
          completedQuests={[]}
        />
      </Provider>
    );

    expect(screen.getByText("No active quests")).toBeInTheDocument();
  });
});
