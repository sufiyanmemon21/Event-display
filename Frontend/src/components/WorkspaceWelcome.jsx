import useAuth from '@/hooks/useAuth';
import { Link } from 'react-router-dom';
import { CalendarDays, Compass, UserRound, ArrowUpRight } from 'lucide-react';
export default function WorkspaceWelcome() {
  const user = useAuth();
  return (
    <section>
      <p className="eyebrow">YOUR EVENTSPHERE WORKSPACE</p>
      <h1 className="dashboard-title">Welcome, {user?.name}.</h1>
      <p className="section-copy">
        A little inspiration. A new connection. Your next experience starts here.
      </p>
      <div className="workspace-banner">
        <div>
          <h2>
            Make space for
            <br />
            something extraordinary.
          </h2>
          <Link to="/" className="button button-light">
            Explore EventSphere <ArrowUpRight size={17} />
          </Link>
        </div>
        <Compass size={100} strokeWidth={1} />
      </div>
      <div className="workspace-grid">
        {[
          [
            CalendarDays,
            'Expo catalog',
            'Explore the expos available to your community.',
            '/dashboard/expos',
          ],
          [
            Compass,
            'Your schedule',
            'Open your session workspace.',
            '/dashboard/schedule',
          ],
          [UserRound, 'Your account', user?.email, '/dashboard'],
        ].map(([Icon, title, description, to]) => (
          <Link className="workspace-card" key={title} to={to}>
            <Icon />
            <h3>{title}</h3>
            <p>{description}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
