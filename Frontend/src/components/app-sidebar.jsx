import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, MessageSquareText, LayoutDashboard, Users, Building2, MapPin, Map, Clock, Bell, BarChart3, Search, MessageSquare, Mail, LogIn, UserPlus, Settings2, Ticket, ClipboardCheck } from "lucide-react";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
const allRoles = ["organizer", "admin", "exhibitor", "attendee"];
const menuItems = [{
  title: "Dashboard",
  url: "/dashboard",
  icon: <LayoutDashboard className="size-4" />,
  group: "Workspace",
  public: true
}, {
  title: "Expos",
  url: "/events",
  icon: <CalendarDays className="size-4" />,
  group: "Workspace",
  roles: allRoles
}, {
  title: "Exhibitors",
  url: "/exhibitors",
  icon: <Building2 className="size-4" />,
  group: "Workspace",
  roles: ["organizer", "admin", "exhibitor"]
}, {
  title: "Attendees",
  url: "/attendees",
  icon: <Users className="size-4" />,
  group: "Workspace",
  roles: ["organizer", "admin", "attendee"]
}, {
  title: "Booths",
  url: "/booths",
  icon: <MapPin className="size-4" />,
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
  icon: <Clock className="size-4" />,
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
  icon: <MessageSquareText className="size-4" />,
  group: "Engagement",
  roles: allRoles
}, {
  title: "Notifications",
  url: "/notifications",
  icon: <Bell className="size-4" />,
  group: "Engagement",
  roles: allRoles
}, {
  title: "Analytics",
  url: "/analytics",
  icon: <BarChart3 className="size-4" />,
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
  icon: <Users className="size-4" />,
  group: "Administration",
  roles: ["admin"]
}, {
  title: "Expo Tickets",
  url: "/expo-tickets",
  icon: <Ticket className="size-4" />,
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
        title: "My Applications"
      };
    }
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
                <span className="grid size-9 group-data-[collapsible=icon]:size-8 shrink-0 place-items-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <CalendarDays className="size-5" />
                </span>
                <span className="grid min-w-0 text-left group-data-[collapsible=icon]:hidden">
                  <span className="truncate text-sm font-semibold tracking-tight">
                    EventSphere
                  </span>
                  <span className="truncate text-[11px] text-sidebar-foreground/60">
                    Experience operations
                  </span>
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        {account.loggedIn && <p className="group-data-[collapsible=icon]:hidden px-2 pt-2 text-[11px] font-medium uppercase tracking-[0.12em] text-sidebar-foreground/55">
            {account.role} workspace
          </p>}
      </SidebarHeader>

      <SidebarContent className="px-3 py-4">
        <NavMain items={items} />
      </SidebarContent>

      {account.loggedIn && <SidebarFooter className="border-t border-sidebar-border px-3 py-3">
          <NavUser onSignOut={onSignOut} />
        </SidebarFooter>}
    </Sidebar>;
}
