"use client";

import Button from "@/components/ui/Button";
import axios from "axios";
import { useRouter } from "next/navigation";
import React from "react";

const VictoryPage = () => {
  const router = useRouter();

  async function handleRetry() {
    try {
      const response = await axios.post("/api/dashboard/user");
      if (response.data.message === "User data reset successfully") {
      }
    } catch (error) {
      console.error("Error resetting user data:", error);
    } finally {
      router.push("/dashboard");
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-6">
      <h1 className="text-6xl md:text-7xl font-bold mb-6 text-blue-300 animate-bounce">
        The Dragon Is Defeated!
      </h1>

      <div className="text-2xl md:text-3xl mb-10 space-y-4">
        <p className="text-yellow-200">✨ Victory! ✨</p>
        <p className="font-bold text-3xl md:text-4xl text-yellow-100">
          You&apos;re the Champion!!!
        </p>
      </div>

      <div className="max-w-2xl text-lg md:text-xl mb-12 space-y-4">
        <p>The ancient beast lies vanquished at your feet.</p>
        <p>Villages celebrate your name in song and story.</p>
        <p>Your legend will endure for generations.</p>
      </div>
      <Button onClick={handleRetry}>Play again?</Button>
    </div>
  );
};

export default VictoryPage;
