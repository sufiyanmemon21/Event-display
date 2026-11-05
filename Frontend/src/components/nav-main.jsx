import { NavLink, useLocation } from "react-router-dom";
import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
export function NavMain({
  items
}) {
  const {
    pathname
  } = useLocation();
  const groups = items.reduce((all, item) => {
    const group = item.group || "Workspace";
    all[group] ??= [];
    all[group].push(item);
    return all;
  }, {});
  return <>
      {Object.entries(groups).map(([group, groupItems]) => <SidebarGroup key={group} className="px-0 py-2">
          <SidebarGroupLabel className="px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-sidebar-foreground/45">
            {group}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {groupItems.map(item => {
            const active = pathname === item.url || item.url !== "/dashboard" && pathname.startsWith(`${item.url}/`);
            return <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild isActive={active} tooltip={{
                children: item.title
              }} className="h-10 rounded-lg px-3 text-[13px] transition-colors data-[active=true]:bg-sidebar-primary data-[active=true]:text-sidebar-primary-foreground data-[active=true]:font-semibold">
                      <NavLink to={item.url} end={item.url === "/dashboard"}>
                        {item.icon}
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>;
          })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>)}
    </>;
}
