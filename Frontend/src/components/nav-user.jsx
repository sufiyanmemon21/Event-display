import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { EllipsisVertical, LogOut } from "lucide-react";
import { clearAuth } from "@/api/api";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useSidebar } from "@/hooks/use-sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

function getUser() {
  if (!localStorage.getItem("token")) return null;

  return {
    name: localStorage.getItem("userName") || "My Account",
    email: localStorage.getItem("userEmail") || "",
    role: localStorage.getItem("userRole") || "attendee",
  };
}

export function NavUser({ onSignOut }) {
  const [user, setUser] = useState(getUser);
  const { isMobile } = useSidebar();
  const navigate = useNavigate();

  useEffect(() => {
    function updateUser() {
      setUser(getUser());
    }

    window.addEventListener("auth-changed", updateUser);
    window.addEventListener("storage", updateUser);

    return () => {
      window.removeEventListener("auth-changed", updateUser);
      window.removeEventListener("storage", updateUser);
    };
  }, []);

  function handleLogout() {
    if (onSignOut) {
      onSignOut();
      return;
    }

    clearAuth();
    navigate("/dashboard/login", { replace: true });
  }

  if (!user) {
    return (
      <div className="grid grid-cols-2 gap-2 p-2">
        <Link
          to="/dashboard/login"
          className="rounded-md border px-3 py-2 text-center text-sm"
        >
          Login
        </Link>

        <Link
          to="/dashboard/signup"
          className="rounded-md bg-primary px-3 py-2 text-center text-sm text-primary-foreground"
        >
          Sign Up
        </Link>
      </div>
    );
  }

  const initials = user.name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton size="lg">
              <Avatar className="size-8 rounded-lg">
                <AvatarFallback className="rounded-lg">
                  {initials}
                </AvatarFallback>
              </Avatar>

              <div className="grid flex-1 text-left text-sm">
                <span className="truncate font-medium">{user.name}</span>
                <span className="truncate text-xs text-muted-foreground [.public-theme_&]:text-[0.8125rem] [.public-theme_&]:leading-[1.4rem]">
                  {user.email}
                </span>
              </div>

              <EllipsisVertical className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
            className="w-56"
          >
            <DropdownMenuLabel>
              <p className="truncate">{user.name}</p>
              <p className="mt-1 text-xs font-normal capitalize text-muted-foreground [.public-theme_&]:text-[0.8125rem] [.public-theme_&]:leading-[1.4rem]">
                {user.role}
              </p>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuItem onSelect={handleLogout}>
              <LogOut className="size-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
