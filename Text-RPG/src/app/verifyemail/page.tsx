"use client";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { request } from "http";

export default function VerifyEmailPage() {
  const [token, setToken] = useState("");
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { isLoggedIn } = useAuth(request);

  useEffect(() => {
    if (isLoggedIn) {
      router.push("/");
    }
  }, [isLoggedIn, router]);

  const verifyUserEmail = async () => {
    try {
      const response = await axios.post<{ success: boolean }>(
        "/api/auth/email-verification-tokens",
        { token }
      );
      if (response.data.success) {
        setVerified(true);
        setTimeout(() => router.push("/login"), 3000);
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.error || "Verification failed");
      } else if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Verification failed");
      }
      console.error("Verification error:", error);
    }
  };

  useEffect(() => {
    if (isLoggedIn) return;

    const queryParams = new URLSearchParams(window.location.search);
    const urlToken = queryParams.get("token");
    if (urlToken) {
      setToken(urlToken);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (isLoggedIn || !token) return;
    verifyUserEmail();
  }, [token, isLoggedIn]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[35rem] text-black">
      <h1 className="text-4xl mb-[5rem] text-black">Verify Email</h1>

      {!token && !error && (
        <>
          <p>A verification link has been sent to your email.</p>
          <p className="my-3">Please check your inbox. </p>
          <p>You have 24 hours to verify your account or it will be deleted.</p>

          <p className="text-3xl mt-5 text-red-700 bg-white">
            !Mailer not functional on free domain!
          </p>

          <Link href="/login" className="defaultButton hover:text-white">
            Continue without verifying
          </Link>
        </>
      )}

      {verified ? (
        <div className="text-center">
          <h2 className="text-2xl mb-2">Email Verified Successfully!</h2>
          <p>Redirecting to login page...</p>
        </div>
      ) : error ? (
        <div className="text-center">
          <h2 className="text-2xl mb-2">Error</h2>
          <p className="mb-4">{error}</p>
          <Link
            href="/signup"
            className="p-2 border rounded-lg hover:bg-[#876c3c] hover:shadow-md"
          >
            Back to Sign Up
          </Link>
        </div>
      ) : null}
    </div>
  );
}
