"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { request } from "https";

interface NavItem {
  href: string;
  label: string;
  active: boolean;
}

export function Navbar() {
  const pathname = usePathname();
  const { isLoggedIn, logout } = useAuth(request);

  const navItems = [
    {
      href: "/",
      label: "Home",
      active: pathname === "/",
    },
    !isLoggedIn && {
      href: "/login",
      label: "Login",
      active: pathname === "/login",
    },
    !isLoggedIn && {
      href: "/register",
      label: "Register",
      active: pathname === "/register",
    },
    isLoggedIn && {
      href: "/dashboard",
      label: "Dashboard",
      active: pathname === "/dashboard",
    },
  ].filter(Boolean) as NavItem[];

  const handleLinkClick = (e: React.MouseEvent, item: NavItem) => {
    if (item.active) {
      e.preventDefault();
    }
  };

  return (
    <nav className="bg-[#754E1A] fixed top-0 left-0 w-full h-[64px] border-b z-50">
      <div className="container mx-auto flex justify-between items-center p-4">
        <div className="flex items-center space-x-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={(e) => handleLinkClick(e, item)}
              className={`
                flex items-center space-x-2 
                ${
                  item.active
                    ? "text-primary font-semibold cursor-default"
                    : "text-muted-foreground hover:text-[#b9b9b9]"
                }
              `}
            >
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
        {isLoggedIn && (
          <button
            onClick={logout}
            className="text-muted-foreground hover:text-[#f34242]"
          >
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}
