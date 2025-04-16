"use client";

import Button from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function Home() {
  const { isLoggedIn } = useAuth();
  const router = useRouter();

  function handleRedirect() {
    router.push(isLoggedIn ? "/dashboard" : "/login");
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">
          Welcome to Dragon Slayer
        </h1>
        <p className="text-lg text-gray-700 mb-4 italic">
          A text-based RPG adventure
        </p>
      </div>

      <div className="mt-10 space-y-6 text-gray-800">
        <p className="text-lg leading-relaxed">
          A dragon has risen, casting a shadow of fear across the land. No one
          knows where it came from or why it has emerged now, but its
          destruction grows with each passing day. The people are helpless, and
          no hero has dared to face it—until now.
        </p>

        <p className="text-lg leading-relaxed">
          This is your moment. The dragon&apos;s trail is faint, but the clues
          are there for those brave enough to follow. You must uncover its
          origins, track its movements, and prepare for the ultimate battle. The
          fate of the land rests on your shoulders alone.
        </p>

        <p className="text-lg leading-relaxed font-medium">
          Will you rise to the challenge and face the dragon?
        </p>
      </div>

      <div className="mt-12 text-center">
        <Button onClick={handleRedirect}>Accept Your Quest</Button>
      </div>
    </div>
  );
}
