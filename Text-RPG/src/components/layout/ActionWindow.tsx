"use client";

import { selectEnemyBasedOnChance } from "@/helpers/selectEnemyBasedOnChance";
import { IEnemy } from "@/interfaces/enemy.interface";
import { IItem, IItemId } from "@/interfaces/items.interface";
import { IAction, ILocation } from "@/interfaces/location.interface";
import { IMerchant } from "@/interfaces/merchant.interface";
import { IItemForSale } from "@/interfaces/merchant.interface";
import axios from "axios";
import React, { useState, useEffect } from "react";
import MerchantWindow from "./MerchantWindow";
import Button from "../ui/Button";
import { IQuest } from "@/interfaces/quest.interface";

interface ActionWindowProps {
  location: ILocation;
  completedActions: string[];
  setMoved: React.Dispatch<React.SetStateAction<boolean>>;
  setEnemy: React.Dispatch<React.SetStateAction<IEnemy | undefined>>;
  setUpdate: React.Dispatch<React.SetStateAction<boolean>>;
  setLogs: React.Dispatch<React.SetStateAction<string[]>>;
  usersGold: number;
  setIsMerchantWindowOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isMerchantWindowOpen: boolean;
  maxHealth: number;
  completedQuests: IQuest[];
  onActionClick: (action: IAction) => void;
  userInventory: IItem[];
}

export default function ActionWindow({
  location,
  setMoved,
  completedActions,
  setEnemy,
  setUpdate,
  setLogs,
  usersGold,
  userInventory,
  maxHealth,
  completedQuests,
  setIsMerchantWindowOpen,
  isMerchantWindowOpen,
  onActionClick,
}: ActionWindowProps) {
  const [userActions, setUserActions] = useState<IAction[]>(location.actions);
  const [shopItems, setShopItems] = useState<IItemForSale[]>([]);
  useEffect(() => /* sets action per location */ {
    setUserActions(location.actions);
  }, [location]);

  useEffect(() => /* adds logs for specific actions */ {
    setLogs((prevLogs) => {
      userActions.forEach((action) => {
        if (!completedActions.includes(action._id)) {
          let logMessage = "";

          const actionName = action.actionType;

          if (actionName === "Gather Items") {
            logMessage =
              "Your Sword and Shield rest on a table. \n Gather your equipment and prepare yourself.";
          } else if (actionName === "Agree to help") {
            logMessage =
              "A villager from the nearby town is asking you to stop the advance of goblins on the village.";
          } else if (actionName === "Ask about the dragon") {
            logMessage =
              "You over hear a conversaion, seems they might have seen where the dragon has flown off to.";
          } else if (actionName === "Find Elven Village") {
            logMessage =
              "The path ends abruptly the only to find the elvs is to wander farther into the darkness.";
          } else if (actionName === "Prove your self") {
            logMessage =
              "A High ranking elf has followed you out of the village, they say: \n If you prove you're strong enough to defeat the dragon we will reveal the path. \n otherwise youll only put our lives at risk.";
          }
          if (logMessage && prevLogs[prevLogs.length - 1] !== logMessage) {
            // Skip if the last log is the same as the current log
            prevLogs.push(logMessage);
          }
        }
      });

      return [...prevLogs];
    });
  }, [userActions, completedActions]);

  const handleClick = async (action: IAction) => {
    onActionClick(action);
    const newLogs: string[] = [];
    const actionName = action.actionType;
    if (action.items) {
      const itemIds = action.items.map((item) => String(item));
      try {
        const response = await axios.post("/api/dashboard/items", { itemIds });
        const items = response.data.addedItems;

        let maxHealthIncrease = 0;
        let damageIncrease = 0;
        let itemsLog = "";

        items.forEach((item: IItemId) => {
          itemsLog += `${item.name} was added to your inventory \n`;

          if (item.effect.includes("Increases attack damage by")) {
            damageIncrease += parseInt(
              item.effect.match(/\d+/)?.[0] || "0",
              10
            );
          }
          if (item.effect.includes("Increases max health by")) {
            maxHealthIncrease += parseInt(
              item.effect.match(/\d+/)?.[0] || "0",
              10
            );
          }
        });
        newLogs.push(itemsLog);
        itemsLog = "";
        setLogs((prev) => [...prev, ...newLogs]);

        if (maxHealthIncrease || damageIncrease) {
          await axios.patch("/api/dashboard/user", {
            maxHealthIncrease,
            damageIncrease,
          });
        }

        await axios.post("/api/dashboard/completedActions", {
          actionId: action._id,
        });
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          console.error(
            "Error updating inventory/stats:",
            error.response?.data?.error || error.message
          );
        } else if (error instanceof Error) {
          console.error("Error updating inventory/stats:", error.message);
        } else {
          console.error("Unknown error updating inventory/stats");
        }
      }
    } else if (actionName === "Speak with merchant") {
      const merchantId = action.destination;
      if (merchantId) {
        try {
          const response = await axios.get(
            `/api/dashboard/merchants/${merchantId}`
          );
          const merchant: IMerchant = response.data;

          newLogs.push(`You are speaking with a ${merchant.name}`);
          setLogs((prev) => [...prev, ...newLogs]);

          setShopItems(merchant.itemsForSale);
          setIsMerchantWindowOpen(true);
        } catch (error: unknown) {
          if (axios.isAxiosError(error)) {
            console.error(
              "Error fetching merchant data:",
              error.response?.data?.error || error.message
            );
            newLogs.push("Failed to speak with the merchant.");
          } else if (error instanceof Error) {
            console.error("Error fetching merchant data:", error.message);
            newLogs.push("Failed to speak with the merchant.");
          } else {
            console.error("Unknown error fetching merchant data");
            newLogs.push("Failed to speak with the merchant.");
          }
          setLogs((prev) => [...prev, ...newLogs]);
        }
      }
    } else if (action.destination) {
      try {
        await axios.post("/api/dashboard/locations", {
          locationId: action.destination,
        });
        setMoved((prev) => !prev); // Trigger Dashboard to fetch new location data
      } catch (error: unknown) {
        console.error("Error changing location:", error);
      }
    } else if (action.quest) {
      try {
        await axios.post("/api/dashboard/quests", {
          questId: action.quest,
        });
        const actionId = action._id;
        await axios.post("/api/dashboard/completedActions", { actionId });
      } catch (error: unknown) {
        console.error("Error starting quest:", error);
      }
    } else if (action.possibleEncounters) {
      const enemyIds = action.possibleEncounters.map(
        (encouter) => encouter.enemyId
      );

      try {
        const response = await axios.post("/api/dashboard/enemies", {
          enemyIds,
        });
        const enemies = response.data;

        const selectedEnemy = selectEnemyBasedOnChance(
          action.possibleEncounters,
          enemies
        );

        if (selectedEnemy) {
          setEnemy(selectedEnemy);
          setLogs((prev) => [
            ...prev,
            `A ${selectedEnemy.name} prepares to attack.`,
          ]);
        }
      } catch (error: unknown) {
        console.error("Error fetching enemy data:", error);
      }
    } else if (actionName === "Rest" || "setCamp") {
      axios.patch("/api/dashboard/user", { updateHealth: maxHealth });
      newLogs.push(`Health is restored, you feel well rested.`);
      setLogs((prev) => [...prev, ...newLogs]);
    }
    setUpdate((prev) => !prev);
  };

  const showAction = (action: IAction) => {
    const actionName = action.actionType;
    {
      // Skip if action is already completed
      if (completedActions.includes(action._id)) {
        return false;
      }

      // Skip Wander action if action not completed
      if (actionName === "Wander") {
        return completedActions.includes("67e2d82018d373ec4404b981");
      }

      // Skip Elven Village if specific quest is not completed
      if (actionName === "Elven Village") {
        const hasCompletedElvenQuest = completedQuests.some(
          (quest) => quest._id.toString() === "67e2d6bb18d373ec4404b97c"
        );
        return hasCompletedElvenQuest;
      }

      if (actionName === "Dragon's Lair") {
        const hasCompletedElvenQuest = completedQuests.some(
          (quest) => quest._id.toString() === "67e2f13018d373ec4404b997"
        );
        return hasCompletedElvenQuest;
      }
      // Show all other actions by default
      return true;
    }
  };

  return (
    <>
      {!isMerchantWindowOpen && (
        <div className="flex flex-col items-center p-4 space-y-4 flex">
          <div className="mb-[5rem]">
            <h1 className="text-xl font-bold text-center">{location.name}</h1>
            <p className="text-md text-center">{location.description}</p>
          </div>

          {/* Action Buttons */}
          <ul className="flex flex-wrap justify-center space-x-4">
            {userActions.filter(showAction).map((action) => (
              <li key={action.actionType} className="mx-2">
                <Button onClick={() => handleClick(action)} addedClass="w-full">
                  {action.actionType}
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
      {isMerchantWindowOpen && (
        <MerchantWindow
          shopItems={shopItems}
          isMerchantOpen={setIsMerchantWindowOpen}
          usersGold={usersGold}
          setUpdate={setUpdate}
          setLogs={setLogs}
          userInventory={userInventory}
        />
      )}
    </>
  );
}
