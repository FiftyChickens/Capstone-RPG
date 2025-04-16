import { IItemForSale } from "@/interfaces/merchant.interface";
import React from "react";
import ItemBox from "../ui/ItemBox";
import Button from "../ui/Button";
import axios from "axios";
import { IItemId } from "@/interfaces/items.interface";

interface MerchantWindowProps {
  shopItems: IItemForSale[];
  isMerchantOpen: React.Dispatch<React.SetStateAction<boolean>>;
  usersGold: number;
  setUpdate: React.Dispatch<React.SetStateAction<boolean>>;
  setLogs: React.Dispatch<React.SetStateAction<string[]>>;
  userInventory: Array<{ itemId: { _id: string; name: string } }>; // Add user inventory prop
}

const MerchantWindow = ({
  shopItems,
  isMerchantOpen,
  usersGold,
  setUpdate,
  setLogs,
  userInventory, // Receive user inventory
}: MerchantWindowProps) => {
  const handleLeave = () => {
    isMerchantOpen(false);
  };

  const handlePurchase = async (item: IItemId, price: number) => {
    let maxHealthIncrease = 0;
    let damageIncrease = 0;

    if (usersGold >= price) {
      try {
        const itemIds = item._id;
        await axios.post("/api/dashboard/items", { itemIds });

        if (item.effect.includes("Increases attack damage by")) {
          damageIncrease += parseInt(item.effect.match(/\d+/)?.[0] || "0", 10);
        }
        if (item.effect.includes("Increases max health by")) {
          maxHealthIncrease += parseInt(
            item.effect.match(/\d+/)?.[0] || "0",
            10
          );
        }

        const updateGold = -price;

        if (maxHealthIncrease || damageIncrease) {
          await axios.patch("/api/dashboard/user", {
            maxHealthIncrease,
            damageIncrease,
            updateGold,
          });
        } else {
          await axios.patch("/api/dashboard/user", { updateGold });
        }
      } catch (error: unknown) {
        const errorMessage = "Error purchasing item";
        console.error(errorMessage);
        setLogs((prev) => [...prev, errorMessage]);
      } finally {
        setUpdate((prev) => !prev);
      }
    } else {
      setLogs((prev) => [...prev, `not enough gold`]);
    }
  };

  // List of special items that should be hidden if already in inventory
  const specialItems = [
    "Basic Sword",
    "Iron Shield",
    "Elven Sword",
    "Elven Armor",
    "Dragon Scale Shield",
  ];

  // Filter shop items to hide special items that user already has
  const filteredShopItems = shopItems.filter((shopItem) => {
    const isSpecialItem = specialItems.includes(shopItem.itemId.name);

    // If it's not a special item, always show it
    if (!isSpecialItem) return true;

    // If it is a special item, only show if user doesn't have it
    return !userInventory.some(
      (invItem) => invItem.itemId.name === shopItem.itemId.name
    );
  });

  return (
    <div>
      <div>
        <ul className="flex flex-wrap justify-center gap-10 h-[13rem] overflow-y-auto snap-y snap-mandatory border-[#754e1a] rounded-lg border-2">
          {filteredShopItems.map((item) => (
            <li key={item._id} className="text-center snap-center snap-always">
              <ItemBox
                name={item.itemId.name}
                effect={item.itemId.effect}
                price={item.price}
                handleClick={() => handlePurchase(item.itemId, item.price)}
                buttonText="Buy"
              />
            </li>
          ))}
        </ul>
      </div>
      <Button onClick={handleLeave} addedClass="">
        Leave
      </Button>
    </div>
  );
};

export default MerchantWindow;

// {
//   "itemIds": "67ad2c5633ae5f1d35ec7bc2"
// }
// {
//   "itemId": "67ad2c5633ae5f1d35ec7bc2"
// }
