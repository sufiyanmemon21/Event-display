import { ConfirmationProvider } from "@/components/workspace-confirmation";
import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import useAuth from "@/hooks/useAuth";
import { clearAuth } from "@/api/api";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
export default function DashboardLayout() {
  const user = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  function signOut() {
    try {
      clearAuth();
      navigate("/login", {
        replace: true
      });
    } catch {
      setError("Sign out failed. Please try again.");
    }
  }
  return <SidebarProvider className="font-sans [&_h1]:font-sans [&_h2]:font-sans [&_h3]:font-sans [&_[data-slot=card]]:rounded-2xl [&_[data-slot=card]]:border [&_[data-slot=card]]:border-border/80 [&_[data-slot=card]]:shadow-sm [&_[data-slot=card]]:ring-0 [&_[data-slot=table-head]]:h-12 [&_[data-slot=table-head]]:bg-muted/60 [&_[data-slot=table-head]]:text-[11px] [&_[data-slot=table-head]]:uppercase [&_[data-slot=table-head]]:tracking-wider [&_[data-slot=table-cell]]:py-4 [&_input]:min-w-0 min-h-svh bg-background text-foreground [--background:oklch(0.978_0.01_48)] [--foreground:oklch(0.26_0.036_42)] [--card:oklch(1_0_0)] [--card-foreground:oklch(0.26_0.036_42)] [--popover:oklch(1_0_0)] [--popover-foreground:oklch(0.26_0.036_42)] [--primary:oklch(0.51_0.075_38)] [--primary-foreground:oklch(0.99_0.005_250)] [--secondary:oklch(0.93_0.028_48)] [--secondary-foreground:oklch(0.32_0.051_41)] [--muted:oklch(0.95_0.02_48)] [--muted-foreground:oklch(0.49_0.039_43)] [--accent:oklch(0.92_0.037_43)] [--accent-foreground:oklch(0.32_0.06_40)] [--border:oklch(0.89_0.027_44)] [--input:oklch(0.87_0.035_43)] [--ring:oklch(0.59_0.087_39)] [--sidebar:oklch(0.25_0.032_40)] [--sidebar-foreground:oklch(0.94_0.015_250)] [--sidebar-primary:oklch(0.83_0.065_47)] [--sidebar-primary-foreground:oklch(0.25_0.032_40)] [--sidebar-accent:oklch(0.34_0.045_41)] [--sidebar-accent-foreground:oklch(0.98_0.005_250)] [--sidebar-border:oklch(0.37_0.044_39)] [--sidebar-ring:oklch(0.83_0.065_47)] [--radius:0.85rem] dark:[--background:oklch(0.16_0.025_258)] dark:[--foreground:oklch(0.94_0.015_250)] dark:[--card:oklch(0.205_0.03_258)] dark:[--card-foreground:oklch(0.94_0.015_250)] dark:[--popover:oklch(0.22_0.032_258)] dark:[--popover-foreground:oklch(0.94_0.015_250)] dark:[--primary:oklch(0.79_0.075_46)] dark:[--primary-foreground:oklch(0.19_0.04_258)] dark:[--secondary:oklch(0.27_0.035_258)] dark:[--secondary-foreground:oklch(0.92_0.02_250)] dark:[--muted:oklch(0.255_0.03_258)] dark:[--muted-foreground:oklch(0.7_0.025_250)] dark:[--accent:oklch(0.3_0.05_258)] dark:[--accent-foreground:oklch(0.94_0.015_250)] dark:[--border:oklch(1_0_0/11%)] dark:[--input:oklch(1_0_0/15%)] dark:[--ring:oklch(0.79_0.075_46)] dark:[--sidebar:oklch(0.13_0.025_258)] dark:[--sidebar-foreground:oklch(0.92_0.015_250)] dark:[--sidebar-primary:oklch(0.79_0.075_46)] dark:[--sidebar-primary-foreground:oklch(0.18_0.035_258)] dark:[--sidebar-accent:oklch(0.23_0.035_258)] dark:[--sidebar-accent-foreground:oklch(0.96_0.01_250)] dark:[--sidebar-border:oklch(1_0_0/9%)] dark:[--sidebar-ring:oklch(0.79_0.075_46)]">
      <AppSidebar onSignOut={signOut} />
      <SidebarInset className="min-w-0 bg-background">
        <SiteHeader user={user} onSignOut={signOut} />
        <main className="min-w-0 flex-1 overflow-x-hidden px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="mx-auto w-full max-w-[1440px]">
            {error && <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                <p role="alert">{error}</p>
                <Button variant="outline" size="sm" onClick={signOut}>
                  Sign out
                </Button>
              </div>}
            <ConfirmationProvider><Outlet /></ConfirmationProvider>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>;
}
