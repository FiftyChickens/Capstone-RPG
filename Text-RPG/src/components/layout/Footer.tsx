import React from "react";

export function Footer() {
  return (
    <div className="fixed bottom-0 left-0 w-full bg-gray-800 text-white p-1 z-50 shadow-lg">
      <div className="flex mx-4 space-x-4">
        <a
          href="https://www.linkedin.com/in/bryan-vu-/"
          className="hover:text-gray-300 transition"
        >
          LinkedIn
        </a>
        <a
          href="https://github.com/FiftyChickens/Capstone-RPG"
          className="hover:text-gray-300 transition"
        >
          Github
        </a>
      </div>
    </div>
  );
}
