import LandingFooter from './LandingFooter';
import LandingNavigation from './LandingNavigation';

export default function PublicPageShell({ children }) {
  return (
    <div className="public-theme min-h-screen bg-[#fffaf6] text-[#342321]">
      <LandingNavigation />
      {children}
      <LandingFooter />
    </div>
  );
}
