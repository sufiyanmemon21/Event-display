import EllipsisLoader from "@/components/EllipsisLoader";
import PublicPageShell from "@/components/landing/PublicPageShell";
import { ConfirmationProvider } from "@/components/workspace-confirmation";
import { Suspense, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import useAuth from "@/hooks/useAuth";
import { clearAuth } from "@/api/api";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
export default function DashboardLayout() {
  const user = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [error, setError] = useState("");
  function signOut() {
    try {
      clearAuth();
      navigate("/login", {
        replace: true,
      });
    } catch {
      setError("Sign out failed. Please try again.");
    }
  }
  if (user?.role === "attendee" && /^\/messages\/?$/i.test(pathname)) {
    return (
      <PublicPageShell>
        <main
          className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-8 sm:py-10 [--background:var(--public-paper)]
          [--foreground:var(--public-ink)] [--card:#fffcf8] [--card-foreground:var(--public-ink)]
          [--primary:var(--public-teal)] [--primary-foreground:white] [--border:var(--public-line)]
          [--input:var(--public-line)] [--muted:var(--public-wash)] [--muted-foreground:var(--public-copy)]"
        >
          <ConfirmationProvider>
            <Suspense fallback={<EllipsisLoader scope="page" />}>
              <Outlet />
            </Suspense>
          </ConfirmationProvider>
        </main>
      </PublicPageShell>
    );
  }
  return (
    <SidebarProvider className="eventsphere-workspace min-h-svh bg-background text-foreground [font-family:var(--font-sans)]">
      <AppSidebar onSignOut={signOut} />
      <SidebarInset className="min-w-0 bg-background">
        <SiteHeader user={user} onSignOut={signOut} />
        <main
          className="workspace-content min-w-0 flex-1 px-3 py-4 sm:px-5 sm:py-5 xl:px-6 xl:py-6 workspace:overflow-x-clip
          workspace:text-sm workspace:leading-relaxed workspace:[overflow-wrap:anywhere]
          [.eventsphere-workspace_&_h1]:font-serif [.eventsphere-workspace_&_h1]:font-normal
          [.eventsphere-workspace_&_h1]:text-[clamp(1.5rem,_2.2vw,_2rem)] [.eventsphere-workspace_&_h1]:leading-[1.1]
          [.eventsphere-workspace_&_h1]:[overflow-wrap:anywhere]
          [.eventsphere-workspace_&_>_div_>_p[role='status']]:p-[14px_16px]
          [.eventsphere-workspace_&_>_div_>_p[role='status']]:[border:1px_solid_var(--border)]
          [.eventsphere-workspace_&_>_div_>_p[role='status']]:rounded-[9px]
          [.eventsphere-workspace_&_>_div_>_p[role='status']]:[background:var(--card)]
          [.eventsphere-workspace_&_>_div_>_p[role='status']]:text-muted-foreground
          [&:has([data-loading-scope='page'])]:flex [&:has([data-loading-scope='page'])]:flex-1
          [&:has([data-loading-scope='page'])]:flex-col [&_div:has([data-loading-scope='page'])]:flex
          [&_div:has([data-loading-scope='page'])]:flex-1 [&_div:has([data-loading-scope='page'])]:flex-col"
        >
          <div className="mx-auto w-full max-w-[1440px]">
            {error && (
              <div
                className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-destructive/30 bg-destructive/5
          px-4 py-3 text-sm text-destructive [.workspace-form-body_fieldset_>_p&]:py-[14px]"
              >
                <p role="alert">{error}</p>
                <Button variant="outline" size="sm" onClick={signOut}>
                  Sign out
                </Button>
              </div>
            )}
            <ConfirmationProvider>
              <Suspense fallback={<EllipsisLoader scope="page" />}>
                <Outlet />
              </Suspense>
            </ConfirmationProvider>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
