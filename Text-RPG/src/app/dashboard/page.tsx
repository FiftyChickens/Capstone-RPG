"use client";

import axios from "axios";
import React, { useEffect, useState } from "react";
import ActionWindow from "@/components/layout/ActionWindow";
import UserWindow from "@/components/layout/UserWindow";
import { IUser } from "@/interfaces/user.interface";
import QuestInventoryWindow from "@/components/layout/QuestInventoryWindow";
import { IEnemy } from "@/interfaces/enemy.interface";
import CombatWindow from "@/components/layout/CombatWindow";
import LogWindow from "@/components/layout/LogWindow";
import { IAction } from "@/interfaces/location.interface";

export default function DashboardPage() {
  const [userInfo, setUserInfo] = useState<IUser>({
    username: "",
    inventory: [],
    activeQuests: [],
    completedQuests: [],
    completedActions: [],
    stats: {
      level: 0,
      XP: 0,
      health: 0,
      maxHealth: 100,
      damage: 0,
      gold: 0,
      location: {
        _id: "67ae4e221f7be1d2e20f48ef",
        name: "",
        description: "",
        actions: [],
      },
      totalPlaytime: 0,
    },
    save() {},
  });
  const [moved, setMoved] = useState(false); // Track location change
  const [enemy, setEnemy] = useState<IEnemy | undefined>(undefined);
  const [update, setUpdate] = useState(false);
  const [usersTurn, setUsersTurn] = useState(true);
  const [userHealth, setUserHealth] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [isMerchantWindowOpen, setIsMerchantWindowOpen] = useState(false);
  const [clickedAction, setClickedAction] = useState<IAction | undefined>(
    undefined
  );

  const handleActionClick = (action: IAction) => {
    setClickedAction(action);
  };
  const handleActionProcessed = () => {
    setClickedAction(undefined);
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await axios.get("/api/dashboard/users");
        setUserInfo(res.data.user); // Update user info
      } catch (error: unknown) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [moved, update]); // Re-fetch data when `moved` changes

  return (
    <div className="text-black min-h-screen flex flex-col bg-[#F8E1B7]">
      {/* Top Half: Action + Combat Window (Left) and User + Quest Inventory (Right) */}
      <div className="flex flex-3/4">
        {/* Left Side: Action + Combat Windows */}
        <div className="flex flex-1 flex-col justify-center items-center p-1 space-y-4 bg-[#b6cbbd] grow">
          {!enemy && (
            <ActionWindow
              location={userInfo.stats.location}
              setMoved={setMoved}
              completedActions={userInfo.completedActions}
              setEnemy={setEnemy}
              setUpdate={setUpdate}
              setLogs={setLogs}
              usersGold={userInfo.stats.gold}
              setIsMerchantWindowOpen={setIsMerchantWindowOpen}
              isMerchantWindowOpen={isMerchantWindowOpen}
              maxHealth={userInfo.stats.maxHealth}
              completedQuests={userInfo.completedQuests}
              onActionClick={handleActionClick}
              userInventory={userInfo.inventory}
            />
          )}

          <CombatWindow
            enemy={enemy}
            setEnemy={setEnemy}
            setUpdate={setUpdate}
            userInfo={userInfo}
            usersTurn={usersTurn}
            setUsersTurn={setUsersTurn}
            setUserHealth={setUserHealth}
            userHealth={userHealth}
            setLogs={setLogs}
          />
        </div>

        {/* Right Side: User + Quest Inventory */}
        <div className="w-1/3 flex flex-1 flex-col p-4 text-base grow">
          <UserWindow userInfo={userInfo} />
          <QuestInventoryWindow
            enemy={enemy}
            setEnemy={setEnemy}
            inventory={userInfo.inventory}
            activeQuests={userInfo.activeQuests}
            completedQuests={userInfo.completedQuests}
            setUpdate={setUpdate}
            usersTurn={usersTurn}
            userLocation={userInfo.stats.location}
            setUsersTurn={setUsersTurn}
            setUserHealth={setUserHealth}
            userMaxHealth={userInfo.stats.maxHealth}
            setLogs={setLogs}
            isMerchantWindowOpen={isMerchantWindowOpen}
            actionId={clickedAction?._id}
            onActionProcessed={handleActionProcessed}
          />
        </div>
      </div>

      {/* Bottom Half: Log Window */}
      <div className="flex-shrink-0 p-4 min-h-[200px]">
        <LogWindow logs={logs} />
      </div>
    </div>
  );
}
