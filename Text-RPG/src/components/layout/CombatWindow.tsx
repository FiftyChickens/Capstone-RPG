import { IEnemy } from "@/interfaces/enemy.interface";
import { IUser } from "@/interfaces/user.interface";
import axios from "axios";
import React, { useEffect, useState } from "react";
import Button from "../ui/Button";
import { useRouter } from "next/navigation";

interface CombatWindowProps {
  enemy: IEnemy | undefined;
  setEnemy: React.Dispatch<React.SetStateAction<IEnemy | undefined>>;
  userInfo: IUser;
  setUpdate: React.Dispatch<React.SetStateAction<boolean>>;
  usersTurn: boolean;
  setUsersTurn: React.Dispatch<React.SetStateAction<boolean>>;
  userHealth: number;
  setUserHealth: React.Dispatch<React.SetStateAction<number>>;
  setLogs: React.Dispatch<React.SetStateAction<string[]>>;
}

interface IStatsPayload {
  updateHealth?: number;
  increaseXP?: number;
  updateGold?: number;
}

const CombatWindow = ({
  enemy,
  setEnemy,
  userInfo,
  setUpdate,
  usersTurn,
  setUsersTurn,
  userHealth,
  setUserHealth,
  setLogs,
}: CombatWindowProps) => {
  const [firstRender, setFirstRender] = useState(true);
  const userStats = userInfo.stats;
  const router = useRouter();

  const userDamage = Math.floor(
    100 * (userStats.level / 90) + userStats.damage
  );

  const enemyDamage = enemy?.damage || 0;

  function applyRandomOffset(value: number, min = -1, max = 3) {
    const range = max - min + 1;
    const offset = Math.floor(Math.random() * range) + min;
    return (value || 0) + offset;
  }

  useEffect(() => {
    if (userStats.health !== userHealth) {
      setUserHealth(userStats.health);
    }

    if (userStats.health <= 0) {
      router.push("/dashboard");
    }
  }, [userStats.health]);

  useEffect(() => {
    if (firstRender) {
      setFirstRender(false);
      return;
    }

    if (enemy && enemy.health <= 0) {
      handleEnemyDefeat();
    }
    if (userHealth <= 0) {
      handleUserDefeat();
    }
  }, [enemy, userHealth]);

  useEffect(() => {
    if (!enemy || usersTurn || enemy.health <= 0) return;

    setTimeout(() => {
      if (enemy?.health || 0 > 0) {
        const damageTaken = applyRandomOffset(enemyDamage);
        setUserHealth((prevHealth) => prevHealth - (damageTaken || 0));
        setLogs((prev) => [
          ...prev,
          `${enemy?.name} has hits you dealing ${damageTaken} damage`,
        ]);
        setUsersTurn(true);
      } else {
        setUsersTurn(true);
        setEnemy(undefined);
      }
    }, 500);
  }, [usersTurn]);

  const handleAttack = () => {
    const userDamageRandom = applyRandomOffset(userDamage);
    if (!enemy || enemy.health <= 0) {
      return;
    }
    setUsersTurn(false);
    setLogs((prev) => [
      ...prev,
      `Your attack deals ${userDamageRandom} damage`,
    ]);
    setEnemy((prevEnemy) => {
      if (!prevEnemy) return prevEnemy;
      const newHealth = prevEnemy.health - userDamageRandom;
      if (newHealth <= 0) {
        setTimeout(() => handleEnemyDefeat(), 100);
        setUsersTurn(true);
        return { ...prevEnemy, health: 0 };
      }

      return {
        ...prevEnemy,
        health: newHealth,
      };
    });
  };

  const calculateFleeSuccess = () => {
    const levelDifference = userInfo.stats.level - (enemy?.level || 0);
    const baseChance = 0.6; // 60% base chance to flee
    const levelBonus = levelDifference * 0.05; // 5% per level difference
    return Math.random() < baseChance + levelBonus;
  };

  const handleFlee = async () => {
    if (!enemy) return;

    const fleeSuccess = calculateFleeSuccess();

    try {
      if (fleeSuccess) {
        // Success case - sync current health with backend
        await axios.patch("/api/dashboard/users/stats", {
          updateHealth: userHealth, // Send current health to keep it in sync
        });
        setLogs((prev) => [...prev, `You got away safely!`]);
      } else {
        // Failed case - take damage
        const damageTaken = applyRandomOffset(enemy.damage, -2, 2);
        const newHealth = Math.max(0, userHealth - damageTaken);

        // Update local state immediately
        setUserHealth(newHealth);

        // Sync with server
        await axios.patch("/api/dashboard/users/stats", {
          updateHealth: newHealth,
        });

        setLogs((prev) => [
          ...prev,
          `You took ${damageTaken} damage while fleeing!`,
        ]);

        if (newHealth <= 0) {
          handleUserDefeat();
        }
      }
    } catch (error) {
      console.error("Failed to update health:", error);
      // Optionally show error to user
      setLogs((prev) => [...prev, "Failed to update health after fleeing"]);
    } finally {
      // Always clear enemy and trigger update
      setEnemy(undefined);
      setUpdate((prev) => !prev);
    }
  };

  const handleEnemyDefeat = async () => {
    if (!enemy || enemy.health > 0) return;

    const randomItem =
      enemy.drop[Math.floor(Math.random() * enemy.drop.length)];
    const itemId = randomItem.itemId._id; // Get the item ID directly
    const goldId = "67ad2c5633ae5f1d35ec7bc5";
    const increaseXP = applyRandomOffset(enemy.level * 3, -3, 7);
    const updateGold = randomItem.quantity;

    if (enemy?.name === "Dragon" && enemy.health <= 0) {
      router.push("/victory");
      return;
    }

    try {
      // First update stats (XP, health, and gold if applicable)
      const statsPayload: Record<string, number> = {
        updateHealth: userHealth,
        increaseXP,
      };

      // If the dropped item is gold, add to stats update
      if (itemId === goldId) {
        statsPayload.updateGold = updateGold;
      }

      const statsResponse = await axios.patch(
        "/api/dashboard/users/stats",
        statsPayload
      );

      // If the dropped item is NOT gold, add to inventory
      if (itemId !== goldId) {
        try {
          await axios.post("/api/dashboard/users/items", {
            itemIds: [itemId],
          });
        } catch (itemError) {
          console.error("Failed to add item to inventory:", itemError);
          setLogs((prev) => [...prev, "Failed to add item to inventory"]);
        }
      }

      setLogs((prev) => [
        ...prev,
        `${enemy?.name} defeated, ${
          randomItem.quantity
        } ${randomItem.itemId.name.toLowerCase()} and ${increaseXP} XP gained.`,
      ]);

      // Update local state based on response if needed
      if (statsResponse.data?.stats?.health) {
        setUserHealth(statsResponse.data.stats.health);
      }
    } catch (error: unknown) {
      console.error("Error defeating enemy:", error);
      setLogs((prev) => [...prev, "Failed to update stats after victory"]);
    } finally {
      setUpdate((prev) => !prev);
      setEnemy(undefined);
      setUsersTurn(true);
    }
  };

  const handleUserDefeat = async () => {
    if (userHealth <= 0)
      try {
        await axios.patch("/api/dashboard/users/stats", { healAmount: 0 });
      } catch (error: unknown) {
        console.error("error updating user health:", error);
      } finally {
        setUpdate((prev) => !prev);
        setEnemy(undefined);
        router.push("/gameover");
      }
  };

  return (
    <div>
      {enemy && (
        <>
          <div className="flex justify-between">
            {enemy.name}: (Level: {enemy.level}, Health: {enemy.health}, Damage:{" "}
            {(enemyDamage || 0) - 1}-{(enemyDamage || 0) + 3})
          </div>
          <p className="my-[5rem]"></p> <p />
          <div>
            {userInfo.username}: Health: {userHealth} Damage: {userDamage - 1}-
            {userDamage + 3}
          </div>
          <div className="flex justify-evenly disable">
            <Button onClick={handleAttack}>Attack</Button>
            <Button onClick={handleFlee}>Flee</Button>
          </div>
        </>
      )}
    </div>
  );
};

export default CombatWindow;
