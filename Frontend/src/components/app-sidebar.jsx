import { LayoutDashboardIcon, CalendarIcon, Building2Icon, UsersIcon, MapPinIcon, ClockIcon, MessageSquareIcon, BellIcon, ChartNoAxesColumnIcon, TicketIcon } from "@animateicons/react/lucide";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, Map, Search, MessageSquare, Mail, LogIn, UserPlus, Settings2, ClipboardCheck, UserRound } from "lucide-react";
import useWebsiteLogo from "@/hooks/useWebsiteLogo";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
const allRoles = ["organizer", "admin", "exhibitor", "attendee"];
const menuItems = [{
  title: "Dashboard",
  url: "/dashboard",
  animatedIcon: LayoutDashboardIcon,
  group: "Workspace",
  public: true
}, {
  title: "Expos",
  url: "/events",
  animatedIcon: CalendarIcon,
  group: "Workspace",
  roles: allRoles
}, {
  title: "Events",
  url: "/dashboard/events",
  animatedIcon: CalendarIcon,
  group: "Workspace",
  roles: allRoles
}, {
  title: "Exhibitors",
  url: "/exhibitors",
  animatedIcon: Building2Icon,
  group: "Workspace",
  roles: ["organizer", "admin", "exhibitor"]
}, {
  title: "Profile",
  url: "/exhibitor-profile",
  icon: <UserRound className="size-4" />,
  group: "Workspace",
  roles: ["exhibitor"]
}, {
  title: "Attendees",
  url: "/attendees",
  animatedIcon: UsersIcon,
  group: "Workspace",
  roles: ["organizer", "admin", "attendee"]
}, {
  title: "Booths",
  url: "/booths",
  animatedIcon: MapPinIcon,
  group: "Workspace",
  roles: ["organizer", "admin", "exhibitor"]
}, {
  title: "Floor Plan",
  url: "/floor-plan",
  icon: <Map className="size-4" />,
  group: "Workspace",
  roles: allRoles
}, {
  title: "Sessions",
  url: "/sessions",
  animatedIcon: ClockIcon,
  group: "Workspace",
  roles: allRoles
}, {
  title: "Search Exhibitors",
  url: "/exhibitor-search",
  icon: <Search className="size-4" />,
  group: "Discovery",
  roles: allRoles
}, {
  title: "Messages",
  url: "/messages",
  animatedIcon: MessageSquareIcon,
  group: "Engagement",
  roles: allRoles
}, {
  title: "Notifications",
  url: "/notifications",
  animatedIcon: BellIcon,
  group: "Engagement",
  roles: allRoles
}, {
  title: "Analytics",
  url: "/analytics",
  animatedIcon: ChartNoAxesColumnIcon,
  group: "Manage",
  roles: ["organizer", "admin"]
}, {
  title: "Feedback",
  url: "/feedback",
  icon: <MessageSquare className="size-4" />,
  group: "Engagement",
  roles: allRoles
}, {
  title: "Users",
  url: "/users",
  animatedIcon: UsersIcon,
  group: "Administration",
  roles: ["admin"]
}, {
  title: "Expo Tickets",
  url: "/expo-tickets",
  animatedIcon: TicketIcon,
  group: "Workspace",
  roles: ["admin", "organizer", "attendee"]
}, {
  title: "Events & Approvals",
  url: "/event-approvals",
  icon: <ClipboardCheck className="size-4" />,
  group: "Manage",
  roles: ["admin", "organizer"]
}, {
  title: "Contact Messages",
  url: "/contact-messages",
  icon: <Mail className="size-4" />,
  group: "Administration",
  roles: ["admin"]
}, {
  title: "Website Settings",
  url: "/website-settings",
  icon: <Settings2 className="size-4" />,
  group: "Administration",
  roles: ["admin"]
} , {
  title: "Contact",
  url: "/contact",
  icon: <Mail className="size-4" />,
  group: "More",
  public: true
}];
function readAccount() {
  const token = localStorage.getItem("token");
  return {
    loggedIn: Boolean(token),
    role: token ? localStorage.getItem("userRole") || "" : ""
  };
}
export function AppSidebar({
  onSignOut,
  ...props
}) {
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
  const items = menuItems.filter(item => item.public || account.loggedIn && item.roles?.includes(account.role)).map(item => {
    if (item.url === "/exhibitors" && account.role === "exhibitor") {
      return {
        ...item,
        title: "Registration"
      };
    }
    if (item.url === "/booths" && account.role === "exhibitor") return { ...item, title: "My Booth" };
    if (item.url === "/attendees" && account.role === "attendee") {
      return {
        ...item,
        title: "Event Registration"
      };
    }
    return item;
  });
  if (!account.loggedIn) {
    items.push({
      title: "Login",
      url: "/dashboard/login",
      icon: <LogIn className="size-4" />,
      group: "Account"
    }, {
      title: "Create Account",
      url: "/dashboard/signup",
      icon: <UserPlus className="size-4" />,
      group: "Account"
    });
  }
  return <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="border-b border-sidebar-border px-3 py-6">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="lg" tooltip="EventSphere">
              <Link to="/dashboard">
                <span className={`size-9 group-data-[collapsible=icon]:size-8 shrink-0 place-items-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground ${logo ? "hidden group-data-[collapsible=icon]:grid" : "grid"}`}>
                  <CalendarDays className="size-5" />
                </span>
                {logo ? <img src={logo} alt="EventSphere" className="h-9 max-w-full object-contain group-data-[collapsible=icon]:hidden" /> : <span className="grid min-w-0 text-left group-data-[collapsible=icon]:hidden">
                  <span className="workspace-wordmark truncate tracking-tight">
                    EventSphere
                  </span>
                  <span className="truncate text-[11px] text-sidebar-foreground/60">
                    Experience operations
                  </span>
                </span>}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        {account.loggedIn && <p className="group-data-[collapsible=icon]:hidden px-2 pt-2 text-[11px] font-medium uppercase tracking-[0.12em] text-sidebar-foreground/55">
            {account.role} portal
          </p>}
      </SidebarHeader>

      <SidebarContent className="px-3 py-4">
        <NavMain items={items} />
      </SidebarContent>

      {account.loggedIn && !["admin", "exhibitor"].includes(account.role) && <SidebarFooter className="border-t border-sidebar-border px-3 py-3">
          <NavUser onSignOut={onSignOut} />
        </SidebarFooter>}
    </Sidebar>;
}
