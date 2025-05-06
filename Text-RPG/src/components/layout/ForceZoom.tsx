"use client";
import { useEffect } from "react";

export default function ForceZoom() {
  useEffect(() => {
    document.body.style.zoom = "100%";

    const blockZoom = (e: KeyboardEvent | WheelEvent) => {
      // Handle keyboard events
      if (
        "key" in e &&
        e.ctrlKey &&
        (e.key === "+" ||
          e.key === "-" ||
          e.key === "=" ||
          e.key === "0" ||
          e.key === "_")
      ) {
        e.preventDefault();
      }

      // Handle wheel events
      if (e.ctrlKey && e.type === "wheel") {
        e.preventDefault();
      }
    };

    window.addEventListener("keydown", blockZoom as EventListener);
    window.addEventListener("wheel", blockZoom as EventListener, {
      passive: false,
    });

    const meta = document.createElement("meta");
    meta.name = "viewport";
    meta.content =
      "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no";
    document.head.appendChild(meta);

    return () => {
      window.removeEventListener("keydown", blockZoom as EventListener);
      window.removeEventListener("wheel", blockZoom as EventListener);
      document.head.removeChild(meta);
    };
  }, []);

  return null;
}
