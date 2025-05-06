import React, { useEffect, useRef } from "react";

// Define the props interface
interface LogWindowProps {
  logs: string[]; // `logs` is an array of strings
}

// Define the component to accept props
const LogWindow: React.FC<LogWindowProps> = ({ logs }) => {
  const logContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to the top when logs change
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);
  if (logs.length > 0)
    return (
      <div
        ref={logContainerRef}
        className="flex flex-col justify-center items-center text-center border-2 border-[#754e1a] rounded-lg max-h-[13rem] w-full overflow-y-auto"
      >
        {logs.slice().map((log, index) => (
          <p
            key={index}
            className={` text-xl px-4 whitespace-pre-line ${
              index === logs.length - 1
                ? "underline underline-offset-2 bg-[#b6cbbd] w-full  py-4"
                : "bg-[#cba35c] w-full"
            }`}
          >
            {log}
          </p>
        ))}
      </div>
    );
};

export default LogWindow;
