"use client";

import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

type AuthContextType = {
  isLoggedIn: boolean;
  logout: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  logout: async () => {},
  login: async () => {},
});

export const useAuth = (_request?: unknown) => useContext(AuthContext);

interface ValidationResponse {
  isLoggedIn: boolean;
}

interface LoginResponse {
  success: boolean;
  message?: string;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const res = await fetch("/api/auth/sessions/me", {
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data: ValidationResponse = await res.json();
        setIsLoggedIn(data.isLoggedIn);

        if (!data.isLoggedIn) {
          notValidated();
        }
      } catch (error) {
        console.error(
          "Error validating auth:",
          error instanceof Error ? error.message : "Unknown error"
        );
        logout();
      }
    };
    checkAuthStatus();
  }, []);

  const notValidated = () => {
    setIsLoggedIn(false);
  };

  const logout = async () => {
    try {
      await axios.delete("/api/auth/logout");
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        console.error(
          "Logout error:",
          error.response?.data?.message || error.message
        );
      } else if (error instanceof Error) {
        console.error("Logout error:", error.message);
      }
    } finally {
      setIsLoggedIn(false);
      router.push("/");
    }
  };

  const login = async (email: string, password: string): Promise<void> => {
    try {
      const response = await axios.post<LoginResponse>("/api/auth/login", {
        email,
        password,
      });

      if (response.data.success) {
        setIsLoggedIn(true);
      } else {
        throw new Error(response.data.message || "Login failed");
      }
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        const errorMessage = error.response?.data?.message || error.message;
        console.error("Login error:", errorMessage);
        throw new Error(errorMessage);
      } else if (error instanceof Error) {
        console.error("Login error:", error.message);
        throw error;
      } else {
        console.error("Unknown login error occurred");
        throw new Error("Unknown error occurred during login");
      }
    }
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, logout, login }}>
      {children}
    </AuthContext.Provider>
  );
}
