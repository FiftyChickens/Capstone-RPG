// GameoverPage.tsx
"use client";

import Button from "@/components/ui/Button";
import axios from "axios";
import { useRouter } from "next/navigation";
import React from "react";

const GameoverPage = () => {
  const router = useRouter();

  async function handleRetry() {
    try {
      await axios.post("/api/dashboard/user");
    } catch (error) {
      console.error("Error resetting user data:", error);
    }
    router.push("/dashboard");
  }

  return (
    <div className="flex flex-col items-center justify-center text-center max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-5xl font-bold mb-6 text-red-600">Game Over</h1>

      <p className="text-xl mb-8 font-medium">You were defeated.</p>

      <div className="space-y-4 text-lg mb-8">
        <p>No one else came to challenge the dragon.</p>
        <p>Shortly after your passing, the dragon grew active again.</p>
        <p>The elves&apos; village was destroyed.</p>
        <p>Then your town fell.</p>
        <p>And eventually... everything else.</p>
      </div>
      <Button onClick={handleRetry} addedClass="mt-4">
        Retry?
      </Button>
    </div>
  );
};

export default GameoverPage;
