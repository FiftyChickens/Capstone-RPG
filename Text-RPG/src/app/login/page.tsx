"use client";
import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import CustomInput from "@/components/ui/CustomInput";
import { request } from "http";
import toast, { Toaster } from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth(request);
  const [user, setUser] = React.useState({
    email: "",
    password: "",
  });
  const [buttonDisabled, setButtonDisabled] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const onLogin = async () => {
    if (buttonDisabled) return;
    try {
      setLoading(true);
      await axios.post("/api/auth/login", user);
      login(user.email, user.password);
      router.push("/dashboard");
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        toast(error.response?.data?.error);
      } else if (error instanceof Error) {
        toast(error.message);
      } else {
        toast("An unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user.email.length > 0 && user.password.length > 0) {
      setButtonDisabled(false);
    } else {
      setButtonDisabled(true);
    }
  }, [user]);

  useEffect(() => {
    if (emailRef.current) {
      emailRef.current.focus();
    }
  }, []);

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    nextInputRef: React.RefObject<HTMLInputElement | null> | null
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (nextInputRef && nextInputRef.current) {
        nextInputRef.current.focus();
      } else if (!nextInputRef) {
        onLogin();
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <Toaster />
      <h1>{loading ? "Processing" : "Login"}</h1>
      <hr />
      <label htmlFor="email">email</label>
      <CustomInput
        id="email"
        type="text"
        value={user.email}
        onChange={(e) => setUser({ ...user, email: e.target.value })}
        onKeyDown={(e) => handleKeyDown(e, passwordRef)}
        ref={emailRef}
        placeholder="email"
      />
      <label htmlFor="password">password</label>
      <CustomInput
        id="password"
        type="password"
        value={user.password}
        onChange={(e) => setUser({ ...user, password: e.target.value })}
        onKeyDown={(e) => handleKeyDown(e, null)}
        ref={passwordRef}
        placeholder="password"
      />
      <button
        onClick={onLogin}
        className={`defaultButton`}
        disabled={buttonDisabled}
      >
        {buttonDisabled ? "Enter valid credentials" : "Login here"}
      </button>
      <Link href="/register" className="my-4">
        Visit sign up page
      </Link>
      <Link href="/reset-password">Forgot password</Link>
    </div>
  );
}
