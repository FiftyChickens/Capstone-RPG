"use client";
import { useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

export default function EmailResetRequestPage() {
  const [email, setEmail] = useState("");

  const handleRequest = async () => {
    try {
      await axios.post("/api/auth/reset", { email });
      toast.success("Check your email for the reset link.", { duration: 6000 });
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast(error.message, { duration: 6000 });
      } else {
        toast("Something went wrong.", { duration: 6000 });
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Toaster />
      <h1>Reset Password</h1>
      <p className="text-3xl my-5 text-red-700 bg-white">
        !Mailer not functional on free domain!
      </p>
      <input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border rounded-lg p-2 text-black"
      />
      <button onClick={handleRequest} className="defaultButton">
        Request Reset Link
      </button>
    </div>
  );
}
