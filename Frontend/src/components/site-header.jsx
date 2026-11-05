import { useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowUpRight, Moon, Sun } from "lucide-react";
import { ThemeContext } from "@/context/theme-context";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { LogOut } from "lucide-react";
const titles = {
  "/dashboard": "Overview",
  "/users": "User management",
  "/website-settings": "Website settings",
  "/contact-messages": "Contact inbox",
  "/expo-tickets": "Expo tickets",
  "/event-approvals": "Events & approvals",
  "/events": "Expos",
  "/exhibitors": "Exhibitors",
  "/attendees": "Registrations",
  "/booths": "Booths",
  "/floor-plan": "Floor plan",
  "/sessions": "Schedule & bookmarks",
  "/exhibitor-search": "Discover exhibitors",
  "/messages": "Messages",
  "/notifications": "Notifications",
  "/analytics": "Analytics",
  "/feedback": "Feedback & support",
  "/contact": "Contact",
};
function getTitle(pathname) {
  const path = pathname.toLowerCase().replace(/\/+$/, "") || "/dashboard";
  if (titles[path]) return titles[path];
  return titles[`/${path.split("/")[1]}`] || "EventSphere";
}
function initials(name = "") {
  return name.trim().split(/\s+/).slice(0, 2).map(part => part[0]).join("").toUpperCase();
}
export function SiteHeader({
  user,
  onSignOut
}) {
  const {
    theme,
    toggleTheme
  } = useContext(ThemeContext);
  const {
    pathname
  } = useLocation();
  const title = getTitle(pathname);
  return <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center border-b border-border/80 bg-card/90 backdrop-blur-xl">
      <div className="flex w-full items-center gap-3 px-4 sm:px-6">
        <SidebarTrigger className="-ml-1 rounded-xl" />
        <Separator orientation="vertical" className="h-5" />
        <Breadcrumb className="min-w-0">
          <BreadcrumbList className="flex-nowrap gap-2">
            <BreadcrumbItem className="hidden sm:inline-flex">
              <BreadcrumbLink asChild>
                <Link to="/dashboard">Workspace</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden sm:inline-flex" />
            <BreadcrumbItem className="min-w-0">
              <BreadcrumbPage className="truncate font-medium">
                {title}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <Button asChild variant="ghost" size="sm" className="hidden text-muted-foreground sm:inline-flex">
            <Link to="/">
              View website
              <ArrowUpRight className="ml-1 size-4" />
            </Link>
          </Button>
          <Button type="button" variant="outline" size="icon" onClick={toggleTheme} aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"} className="rounded-xl">
            {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="ghost" className="h-10 gap-2 rounded-xl px-2 sm:gap-3 sm:px-3">
                <Avatar className="size-8">
                  <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                    {initials(user?.name)}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden max-w-36 text-left sm:grid">
                  <span className="truncate text-xs font-semibold">
                    {user?.name || "Account"}
                  </span>
                  <span className="truncate text-[11px] capitalize text-muted-foreground">
                    {user?.role || "member"}
                  </span>
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60">
              <DropdownMenuLabel className="font-normal">
                <span className="block truncate text-sm font-medium text-foreground">
                  {user?.name || "Account"}
                </span>
                <span className="mt-1 block truncate text-xs text-muted-foreground">
                  {user?.email}
                </span>
                <Badge variant="secondary" className="mt-2 capitalize">
                  {user?.role || "member"}
                </Badge>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={onSignOut}>
                <LogOut className="size-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>;
}
