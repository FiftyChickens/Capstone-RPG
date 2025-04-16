// QuestInventoryWindow.tsx
"use client";

import { IEnemy } from "@/interfaces/enemy.interface";
import { IItem, IItemId } from "@/interfaces/items.interface";
import { IQuest } from "@/interfaces/quest.interface";
import axios from "axios";
import { useEffect, useState } from "react";
import ItemBox from "../ui/ItemBox";
import Button from "../ui/Button";
import { ILocation } from "@/interfaces/location.interface";

interface QuestInventoryWindowProps {
  inventory: IItem[];
  activeQuests: { questId: IQuest; progress: number }[];
  completedQuests: IQuest[];
  setUpdate: React.Dispatch<React.SetStateAction<boolean>>;
  usersTurn: boolean;
  setUsersTurn: React.Dispatch<React.SetStateAction<boolean>>;
  enemy: IEnemy | undefined;
  setEnemy: React.Dispatch<React.SetStateAction<IEnemy | undefined>>;
  setUserHealth: React.Dispatch<React.SetStateAction<number>>;
  userMaxHealth: number;
  setLogs: React.Dispatch<React.SetStateAction<string[]>>;
  isMerchantWindowOpen: boolean;
  userLocation: ILocation;
  actionId: string | undefined;
  onActionProcessed?: () => void;
}

export default function QuestInventoryWindow({
  inventory,
  activeQuests,
  completedQuests,
  setUpdate,
  usersTurn,
  setUsersTurn,
  enemy,
  setEnemy,
  setUserHealth,
  userMaxHealth,
  userLocation,
  setLogs,
  isMerchantWindowOpen,
  actionId,
  onActionProcessed,
}: QuestInventoryWindowProps) {
  const [showQuests, setShowQuests] = useState(true);
  const [showInventory, setShowInventory] = useState(true);

  const handleUseItem = async (itemId: string, itemStats: IItemId) => {
    if (!usersTurn) return;

    let healAmount = 0;
    let damageAmount = 0;

    if (itemStats.type === "potion") {
      if (itemStats.name === "Fireball Potion") {
        if (!enemy) return;
        setUsersTurn(false);
        damageAmount += parseInt(itemStats.effect.match(/\d+/)?.[0] || "0", 10);

        try {
          setEnemy((prevEnemy) => {
            if (!prevEnemy) return prevEnemy;
            return { ...prevEnemy, health: prevEnemy.health - damageAmount };
          });

          setLogs((prev) => [
            ...prev,
            `Used ${itemStats.name} dealing ${damageAmount} damage to ${enemy.name}`,
          ]);
          await axios.patch("/api/dashboard/items", { useItemId: itemId });
        } catch (error) {
          console.error("Error using item:", error);
        } finally {
          setUpdate((prev) => !prev);
        }
      } else {
        healAmount += parseInt(itemStats.effect.match(/\d+/)?.[0] || "0", 10);

        try {
          if (enemy) {
            setUsersTurn(false);
            setUserHealth((prev) => Math.min(prev + healAmount, userMaxHealth));
          } else {
            await axios.patch("/api/dashboard/user", {
              healAmount: healAmount,
            });
          }
          await axios.patch("/api/dashboard/items", { useItemId: itemId });
          setLogs((prev) => [
            ...prev,
            `Used ${itemStats.name} restoring ${healAmount} health.`,
          ]);
        } catch (error) {
          console.error("Error using item:", error);
        } finally {
          setUpdate((prev) => !prev);
        }
      }
    }
  };
  const handleSellItem = async (itemId: string, itemStats: IItemId) => {
    try {
      await axios.patch("/api/dashboard/items", { useItemId: itemId });
      await axios.patch("/api/dashboard/user", { updateGold: itemStats.value });
      setLogs((prev) => [
        ...prev,
        `Sold ${itemStats.name} for ${itemStats.value} gold`,
      ]);
    } catch (error) {
      console.error("Error selling item", error);
    } finally {
      setUpdate((prev) => !prev);
    }
  };

  const handleSellAllOfType = async (
    itemId: string,
    itemStats: IItemId,
    quantity: number
  ) => {
    try {
      const totalValue = itemStats.value * quantity;

      // delete all items of this type
      await axios.patch("/api/dashboard/items", {
        sellItemIds: itemId,
        sellQuantity: quantity,
      });
      // update gold
      await axios.patch("/api/dashboard/user", {
        updateGold: totalValue,
      });

      setLogs((prev) => [
        ...prev,
        `Sold ${quantity} ${itemStats.name}s for ${totalValue} gold`,
      ]);
    } catch (error) {
      console.error("Error selling items:", error);
    } finally {
      setUpdate((prev) => !prev);
    }
  };

  const findQuestByTarget = (
    activeQuests: { questId: IQuest; progress: number }[],
    targetId: string | undefined
  ) => {
    if (!targetId) return undefined;
    return activeQuests.find(
      (quest) => quest.questId.objectives?.target?.toString() === targetId
    );
  };

  const updateQuestProgress = async (quest: {
    questId: IQuest;
    progress: number;
  }) => {
    if (!quest) return;

    try {
      const response = await axios.patch("/api/dashboard/user", {
        questId: quest.questId._id,
        questProgressIncrease: 1,
      });

      if (response.data.message === "Quest completed!") {
        const rewards = response.data.rewards;
        setLogs((prev) => [
          ...prev,
          `Quest Complete! Received XP: ${rewards.XP}, Gold: ${rewards.gold}`,
        ]);
      }
    } catch (error) {
      console.error("Failed to update quest progress", error);
    } finally {
      setUpdate((prev) => !prev);
      onActionProcessed?.();
    }
  };

  useEffect(() => {
    const locationQuest = findQuestByTarget(
      activeQuests,
      userLocation._id.toString()
    );
    if (locationQuest) updateQuestProgress(locationQuest);
  }, [userLocation._id]);

  useEffect(() => {
    if (!enemy || enemy.health > 0) return;
    const enemyQuest = findQuestByTarget(activeQuests, enemy._id.toString());
    if (enemyQuest) updateQuestProgress(enemyQuest);
  }, [enemy]);

  useEffect(() => {
    if (!actionId) return;
    const actionQuest = findQuestByTarget(activeQuests, actionId);
    if (actionQuest) updateQuestProgress(actionQuest);
  }, [actionId]);

  const handleViewClick = (key: string) => {
    switch (key) {
      case "inventory":
        setShowInventory(true);
        break;
      case "quests":
        setShowInventory(false);
        setShowQuests(true);
        break;
      case "active":
        setShowInventory(false);
        setShowQuests(false);
        break;
      default:
        break;
    }
  };
  return (
    <div className="space-y-2">
      <div className="flex flex-row justify-evenly gap-2 mt-2">
        <Button addedClass="mb-0" onClick={() => handleViewClick("inventory")}>
          Inventory
        </Button>
        <Button addedClass="mb-0" onClick={() => handleViewClick("active")}>
          Active Quests
        </Button>
        <Button addedClass="mb-0" onClick={() => handleViewClick("quests")}>
          Completed Quests
        </Button>
      </div>

      {showInventory ? (
        <div className="h-72 overflow-y-auto border-2 border-[#754e1a] rounded-lg">
          {inventory
            .slice()
            .reverse()
            .map((item) => (
              <ItemBox
                key={item._id}
                name={`${item.quantity > 1 ? item.quantity : ""} ${
                  item.itemId.name
                }`}
                effect={item.itemId.effect}
                price={
                  isMerchantWindowOpen &&
                  ![
                    "Basic Sword",
                    "Iron Shield",
                    "Elven Sword",
                    "Elven Armor",
                    "Dragon Scale Shield",
                  ].includes(item.itemId.name)
                    ? item.itemId.value
                    : ""
                }
                handleClick={() => {
                  if (isMerchantWindowOpen) {
                    if (item.quantity > 1 && item.itemId.type !== "potion") {
                      handleSellAllOfType(item._id, item.itemId, item.quantity);
                    } else {
                      handleSellItem(item._id, item.itemId);
                    }
                  } else {
                    handleUseItem(item._id, item.itemId);
                  }
                }}
                buttonText={
                  isMerchantWindowOpen &&
                  ![
                    "Basic Sword",
                    "Iron Shield",
                    "Elven Sword",
                    "Elven Armor",
                    "Dragon Scale Shield",
                  ].includes(item.itemId.name)
                    ? item.quantity > 1 && item.itemId.type !== "potion"
                      ? "Sell All"
                      : "Sell"
                    : item.itemId.type === "potion"
                      ? "Use"
                      : ""
                }
              />
            ))}
        </div>
      ) : (
        <div className="h-64 overflow-y-auto border-2 border-[#754e1a] rounded-lg p-2">
          {!showQuests ? (
            <>
              <h3 className="font-bold text-lg mb-2">Active Quests</h3>
              {activeQuests.length > 0 ? (
                activeQuests.map((quest) => (
                  <div
                    key={quest.questId._id.toString()}
                    className="border-b border-[#754e1a] pb-2"
                  >
                    <h4 className="font-semibold">{quest.questId.name}</h4>
                    <p className="text-sm">{quest.questId.description}</p>
                    <div className="mt-1">
                      <p className="font-medium">Progress:</p>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-[#754e1a] h-2.5 rounded-full"
                          style={{
                            width: `${
                              (quest.progress /
                                (quest.questId.objectives?.quantity ?? 1)) *
                              100
                            }%`,
                          }}
                        />
                      </div>
                      <p>
                        {quest.progress}/{quest.questId.objectives?.quantity}
                      </p>
                    </div>
                    <div className="mt-1">
                      <p className="font-medium">Rewards:</p>
                      <ul className="list-disc list-inside">
                        <li>XP: {quest.questId.rewards.XP}</li>
                        <li>Gold: {quest.questId.rewards.gold}</li>
                      </ul>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 mt-4">
                  No active quests
                </p>
              )}
            </>
          ) : (
            <>
              <h3 className="font-bold text-lg mb-2">Completed Quests</h3>
              {completedQuests.length > 0 ? (
                completedQuests.map((quest) => (
                  <div
                    key={quest._id.toString()}
                    className="border border-[#754e1a] p-2 rounded"
                  >
                    <h4 className="font-semibold">{quest.name}</h4>
                    <p className="text-sm">{quest.description}</p>
                    <div className="mt-1">
                      <p className="font-medium">Rewards Earned:</p>
                      <p>
                        XP: {quest.rewards.XP} | Gold: {quest.rewards.gold}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 mt-4">
                  No completed quests yet
                </p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
