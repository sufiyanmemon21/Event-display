import {
  LayoutDashboardIcon,
  CalendarIcon,
  Building2Icon,
  UsersIcon,
  MapPinIcon,
  ClockIcon,
  MessageSquareIcon,
  BellIcon,
  ChartNoAxesColumnIcon,
  TicketIcon,
  UserPlusIcon,
  LogInIcon,
  MailIcon,
  SearchIcon,
  MapIcon,
  ClipboardCheckIcon,
  UserRoundIcon,
} from "@animateicons/react/lucide";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  CalendarDays,
  MessageSquare,
  Settings2,
} from "lucide-react";
import useWebsiteLogo from "@/hooks/useWebsiteLogo";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
const allRoles = ["organizer", "admin", "exhibitor", "attendee"];
const menuItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    animatedIcon: LayoutDashboardIcon,
    group: "Workspace",
    public: true,
  },
  {
    title: "Expos",
    url: "/events",
    animatedIcon: CalendarIcon,
    group: "Workspace",
    roles: allRoles,
  },
  {
    title: "Events",
    url: "/dashboard/events",
    animatedIcon: CalendarIcon,
    group: "Workspace",
    roles: allRoles,
  },
  {
    title: "Exhibitors",
    url: "/exhibitors",
    animatedIcon: Building2Icon,
    group: "Workspace",
    roles: ["organizer", "admin", "exhibitor"],
  },
  {
    title: "Attendees",
    url: "/attendees",
    animatedIcon: UsersIcon,
    group: "Workspace",
    roles: allRoles,
  },
  {
    title: "Booths",
    url: "/booths",
    animatedIcon: MapPinIcon,
    group: "Workspace",
    roles: ["organizer", "admin", "exhibitor"],
  },
  {
    title: "Floor Plan",
    url: "/floor-plan",
    animatedIcon: MapIcon,
    group: "Workspace",
    roles: allRoles,
  },
  {
    title: "Sessions",
    url: "/sessions",
    animatedIcon: ClockIcon,
    group: "Workspace",
    roles: allRoles,
  },
  {
    title: "Search Exhibitors",
    url: "/exhibitor-search",
    animatedIcon: SearchIcon,
    group: "Discovery",
    roles: allRoles,
  },
  {
    title: "Messages",
    url: "/messages",
    animatedIcon: MessageSquareIcon,
    group: "Engagement",
    roles: allRoles,
  },
  {
    title: "Notifications",
    url: "/notifications",
    animatedIcon: BellIcon,
    group: "Engagement",
    roles: allRoles,
  },
  {
    title: "Analytics",
    url: "/analytics",
    animatedIcon: ChartNoAxesColumnIcon,
    group: "Manage",
    roles: ["organizer", "admin"],
  },
  {
    title: "Feedback",
    url: "/feedback",
    icon: <MessageSquare className="size-4" />,
    group: "Engagement",
    roles: allRoles,
  },
  {
    title: "Users",
    url: "/users",
    animatedIcon: UsersIcon,
    group: "Administration",
    roles: ["admin"],
  },
  {
    title: "Expo Tickets",
    url: "/expo-tickets",
    animatedIcon: TicketIcon,
    group: "Workspace",
    roles: allRoles,
  },
  {
    title: "Events & Approvals",
    url: "/event-approvals",
    animatedIcon: ClipboardCheckIcon,
    group: "Manage",
    roles: ["admin", "organizer", "exhibitor"],
  },
  {
    title: "Contact Messages",
    url: "/contact-messages",
    animatedIcon: MailIcon,
    group: "Administration",
    roles: ["admin"],
  },
  {
    title: "Website Settings",
    url: "/website-settings",
    icon: <Settings2 className="size-4" />,
    group: "Administration",
    roles: ["admin"],
  },
  {
    title: "Contact",
    url: "/contact",
    animatedIcon: MailIcon,
    group: "More",
    public: true,
  },
];
function readAccount() {
  const token = localStorage.getItem("token");
  return {
    loggedIn: Boolean(token),
    role: token ? localStorage.getItem("userRole") || "" : "",
  };
}
export function AppSidebar({ onSignOut, ...props }) {
  const [account, setAccount] = useState(readAccount);
  const logo = useWebsiteLogo();
  useEffect(() => {
    function updateAccount() {
      setAccount(readAccount());
    }
    window.addEventListener("auth-changed", updateAccount);
    window.addEventListener("storage", updateAccount);
    return () => {
      window.removeEventListener("auth-changed", updateAccount);
      window.removeEventListener("storage", updateAccount);
    };
  }, []);
  const items = menuItems
    .filter(
      (item) =>
        item.public || (account.loggedIn && item.roles?.includes(account.role)),
    )
    .map((item) => {
      if (item.url === "/exhibitors" && account.role === "exhibitor") {
        return {
          ...item,
          title: "Registration",
        };
      }
      if (item.url === "/booths" && account.role === "exhibitor")
        return { ...item, title: "My Booth" };
      if (item.url === "/attendees" && account.role === "attendee") {
        return {
          ...item,
          title: "Event Registration",
        };
      }
      return item;
    });
  if (!account.loggedIn) {
    items.push(
      {
        title: "Login",
        url: "/dashboard/login",
        animatedIcon: LogInIcon,
        group: "Account",
      },
      {
        title: "Create Account",
        url: "/dashboard/signup",
        animatedIcon: UserPlusIcon,
        group: "Account",
      },
    );
  }
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="border-b border-sidebar-border px-3 py-6">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="lg" tooltip="EventSphere">
              <Link to="/dashboard">
                <span
                  className={`size-9 group-data-[collapsible=icon]:size-8 shrink-0 place-items-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground ${logo ? "hidden group-data-[collapsible=icon]:grid" : "grid"}`}
                >
                  <CalendarDays className="size-5" />
                </span>
                {logo ? (
                  <img
                    src={logo}
                    alt="EventSphere"
                    className="h-9 max-w-full object-contain group-data-[collapsible=icon]:hidden"
                  />
                ) : (
                  <span className="grid min-w-0 text-left group-data-[collapsible=icon]:hidden">
                    <span className="workspace-wordmark truncate tracking-tight [font:1.2rem/1.1_Georgia,_serif]">
                      EventSphere
                    </span>
                    <span className="truncate text-[11px] text-sidebar-foreground/60">
                      Event management
                    </span>
                  </span>
                )}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        {account.loggedIn && (
          <p className="group-data-[collapsible=icon]:hidden px-2 pt-2 text-[11px] font-medium uppercase tracking-[0.12em] text-sidebar-foreground/55">
            {account.role} portal
          </p>
        )}
      </SidebarHeader>

      <SidebarContent className="px-3 py-4">
        <NavMain items={items} />
      </SidebarContent>

      {account.loggedIn && account.role !== "admin" && (
        <SidebarFooter className="border-t border-sidebar-border px-3 py-3">
          {["attendee", "exhibitor"].includes(account.role) && <NavMain items={[{ title: "My profile", url: account.role === "attendee" ? "/profile" : "/exhibitor-profile", animatedIcon: UserRoundIcon, group: "Account" }]} />}
          {account.role !== "exhibitor" && <NavUser onSignOut={onSignOut} />}
        </SidebarFooter>
      )}
    </Sidebar>
  );
}
