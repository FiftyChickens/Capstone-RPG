"use client";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios, { AxiosError } from "axios";
import CustomInput from "@/components/ui/CustomInput";
import toast, { Toaster } from "react-hot-toast";

export default function RegisterPage() {
  const router = useRouter();
  const [user, setUser] = React.useState({
    email: "",
    password: "",
    username: "",
  });
  const [buttonDisabled, setButtonDisabled] = React.useState(true);
  const [loading, setLoading] = useState(false);
  const usernameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const toastIdRef = useRef<string | undefined>(null);

  useEffect(() => {
    return () => {
      if (toastIdRef.current) toast.dismiss(toastIdRef.current);
    };
  }, []);

  function hasSpecialCharacter(password: string) {
    const specialCharRegex = /[^a-zA-Z0-9]/;
    return specialCharRegex.test(password);
  }

  function isValidEmail(email: string) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  function validateUserInput(user: {
    email: string;
    password: string;
    username: string;
  }) {
    let isValid = true;
    let errorMessage = "";
    let timer = 0;

    if (user.username.length < 3) {
      errorMessage += "Username must be at least 3 characters long.\n\n";
      isValid = false;
      timer += 3000;
    }
    if (!isValidEmail(user.email)) {
      errorMessage += "Please enter a valid email address.\n\n";
      isValid = false;
      timer += 3000;
    }
    if (user.password.length < 5) {
      errorMessage += "Password must be at least 5 characters long.\n\n";
      isValid = false;
      timer += 3000;
    }
    if (!hasSpecialCharacter(user.password)) {
      errorMessage += "Password must contain at least one special character.";
      isValid = false;
      timer += 3000;
    }

    if (errorMessage.length > 0) {
      if (toastIdRef.current) toast.dismiss(toastIdRef.current);
      toastIdRef.current = toast.error(errorMessage, { duration: timer });
    }

    return isValid;
  }

  const onSignup = async () => {
    if (!validateUserInput(user)) return;

    try {
      setLoading(true);
      const response = await axios.post("/api/auth/register", user);

      if (response.status === 201) {
        if (toastIdRef.current) toast.dismiss(toastIdRef.current);
        toastIdRef.current = toast.success("Account created successfully!");
        router.push("/verifyemail");
      }
    } catch (error: unknown) {
      let errorMessage = "Signup failed";

      if (error instanceof AxiosError) {
        errorMessage = error.response?.data?.message || error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setButtonDisabled(!(user.email && user.password && user.username));
  }, [user]);

  useEffect(() => {
    usernameRef.current?.focus();
  }, []);

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    nextInputRef?: React.RefObject<HTMLInputElement | null>
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (nextInputRef?.current) {
        nextInputRef.current.focus();
      } else {
        onSignup();
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <Toaster position="top-center" />
      <h1>{loading ? "Processing" : "Sign up"}</h1>
      <hr />
      <label htmlFor="username">Username</label>
      <CustomInput
        id="username"
        type="text"
        value={user.username}
        onChange={(e) => setUser({ ...user, username: e.target.value })}
        placeholder="Username"
        onKeyDown={(e) => handleKeyDown(e, emailRef)}
        ref={usernameRef}
      />
      <label htmlFor="email">Email</label>
      <CustomInput
        id="email"
        type="email"
        value={user.email}
        onChange={(e) => setUser({ ...user, email: e.target.value })}
        onKeyDown={(e) => handleKeyDown(e, passwordRef)}
        ref={emailRef}
        placeholder="Email"
      />
      <label htmlFor="password">Password</label>
      <CustomInput
        id="password"
        type="password"
        value={user.password}
        onChange={(e) => setUser({ ...user, password: e.target.value })}
        onKeyDown={(e) => handleKeyDown(e)}
        ref={passwordRef}
        placeholder="Password"
      />
      <button
        onClick={onSignup}
        disabled={buttonDisabled}
        className={`defaultButton mb-4`}
      >
        {buttonDisabled ? "Please add information" : "Sign up here"}
      </button>
      <Link href="/login">Visit login page</Link>
    </div>
  );
}
