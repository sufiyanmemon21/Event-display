import LandingFooter from "./LandingFooter";
import LandingNavigation from "./LandingNavigation";

export default function PublicPageShell({ children }) {
  return (
    <div
      className="public-theme min-h-screen bg-[var(--public-paper)] [background:var(--public-paper)] text-[var(--public-ink)]
                   [&_footer]:[background-color:#352722]! [&_:focus-visible]:[outline-color:#247d78]
                   [&:has(.celebration-nav)_>_main:not(.celebration-page)]:pt-[max(104px,_7vw)]
                   [&_>_main:has([data-loading-scope='page'])]:flex [&_>_main:has([data-loading-scope='page'])]:min-h-svh
                   [&_>_main:has([data-loading-scope='page'])]:flex-col [&_>_main_div:has(>_[data-loading-scope='page'])]:flex
                   [&_>_main_div:has(>_[data-loading-scope='page'])]:flex-1
                   [&_>_main_div:has(>_[data-loading-scope='page'])]:flex-col
                   [&_>_main_div:has(>_[data-loading-scope='page'])]:w-full"
    >
      <LandingNavigation />
      {children}
      <LandingFooter />
    </div>
  );
}
