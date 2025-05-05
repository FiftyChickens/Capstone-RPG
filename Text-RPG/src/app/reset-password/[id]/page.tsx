"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Extract token from the URL
    const urlToken = window.location.pathname.split("/").pop();
    if (urlToken) setToken(urlToken);
  }, []);

  function hasSpecialCharacter(password: string) {
    const specialCharRegex = /[^a-zA-Z0-9]/;
    return specialCharRegex.test(password);
  }

  const handleResetPassword = async () => {
    let timer = 0;
    let errorMessage = "";

    if (password.length < 5) {
      errorMessage += "Password must be at least 5 characters long";
      timer += 3000;
    } else if (!hasSpecialCharacter(password)) {
      errorMessage += "Password must contain at least one special character.";
      timer += 3000;
    } else {
      try {
        await axios.post("/api/auth/confirm", { token, password });
        setSuccess(true);
        toast.success("Password reset successfully. You can now log in.");
        setTimeout(() => router.push("/login"), 2000); // Redirect after success
      } catch (error: unknown) {
        setError(true);

        if (error instanceof Error) {
          toast.error(error.message || "Something went wrong.");
        } else if (typeof error === "string") {
          toast.error(error);
        } else {
          toast.error("Something went wrong.");
        }
      }
    }
    toast(errorMessage, { duration: timer });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Toaster />
      <h1 className="text-4xl">Reset Password</h1>
      <h2 className="p-2 text-black">{token ? "" : "No token found"}</h2>

      {success ? (
        <div>
          <h2 className="text-2xl text-green-500">
            Password Reset Successfully
          </h2>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <input
            type="password"
            placeholder="Enter new password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border p-2"
          />
          <button onClick={handleResetPassword} className="defaultButton">
            Reset Password
          </button>
        </div>
      )}

      {error && (
        <h2 className="text-2xl bg-red-500 text-black">Error occurred</h2>
      )}
    </div>
  );
}
