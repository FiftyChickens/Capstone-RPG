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

  // Update user health after a short delay (simulate enemy attack)
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

  const handleFlee = () => {
    if (!enemy) return;
    const hitchance = Math.floor(
      Math.random() * 3 + Math.floor(userInfo.stats.level / enemy.level)
    );

    if (hitchance >= 1) {
      setUserHealth((prevHealth) => {
        const updateHealth = (prevHealth -=
          applyRandomOffset(enemy?.damage, -2, -7) || 0);
        axios
          .patch("/api/dashboard/users", { updateHealth: updateHealth })
          .catch((error) => {
            console.error("error updating user health:", error);
          });

        return updateHealth;
      });
      setLogs((prev) => [
        ...prev,
        `You took ${enemy?.damage} damage getting away.`,
      ]);
    } else {
      setLogs((prev) => [...prev, `You got away safely!`]);
      axios.patch("/api/dashboard/users", { updateHealth: userHealth });
    }
    setEnemy(undefined);
    handleUserDefeat();
    setUpdate((prev) => !prev);
  };

  const handleEnemyDefeat = async () => {
    if (!enemy || enemy.health > 0) return;

    const randomItem =
      enemy.drop[Math.floor(Math.random() * enemy.drop.length)];
    const itemIds = [randomItem.itemId._id];
    const gold = "67ad2c5633ae5f1d35ec7bc5";
    const increaseXP = applyRandomOffset(enemy.level * 3, -3, 7); // Reward XP
    const updateGold = randomItem.quantity;

    if (enemy?.name === "Dragon" && enemy.health <= 0) {
      router.push("/victory");
      return;
    }

    try {
      await axios.patch("/api/dashboard/users", { updateHealth: userHealth });
      await axios.patch("/api/dashboard/users", {
        increaseXP,
      });

      if (String(itemIds) === gold) {
        await axios.patch("/api/dashboard/users", { updateGold });
      } else {
        await axios.post("/api/dashboard/items", { itemIds });
      }
      setLogs((prev) => [
        ...prev,

        `${enemy?.name} defeated, ${
          randomItem.quantity
        } ${randomItem.itemId.name.toLowerCase()} and ${increaseXP} XP gained.`,
      ]);
    } catch (error: unknown) {
      console.error("error defeating enemy:", error);
    } finally {
      setUpdate((prev) => !prev);
      setEnemy(undefined);
      setUsersTurn(true);
    }
  };

  const handleUserDefeat = async () => {
    if (userHealth <= 0)
      try {
        await axios.patch("/api/dashboard/users", { healAmount: 0 }); // Set health to 0
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
