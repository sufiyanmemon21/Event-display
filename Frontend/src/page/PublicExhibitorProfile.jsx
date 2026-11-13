import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Building2, Mail, Phone, Globe, ArrowLeft } from "lucide-react";
import API from "@/api/api";
import PublicPageShell from "@/components/landing/PublicPageShell";
import EventCard from "@/components/landing/EventCard";
import EllipsisLoader from "@/components/EllipsisLoader";

function publicWebsite(value) {
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) && !url.username && !url.password ? url.href : null;
  } catch { return null; }
}

export default function PublicExhibitorProfile() {
  const { userId } = useParams();
  return <ExhibitorProfileContent key={userId} userId={userId} />;
}

function ExhibitorProfileContent({ userId }) {
  const [state, setState] = useState({ loading: true });
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    API.get(`/exhibitors/public/${userId}`, { signal: controller.signal })
      .then(({ data }) => { if (!controller.signal.aborted) setState({ ...data, loading: false }); })
      .catch(error => {
        if (!controller.signal.aborted) setState({ loading: false, error: error.response?.data?.msg || "Unable to load this exhibitor. Please try again." });
      });
    return () => controller.abort();
  }, [userId, revision]);
  useEffect(() => {
    document.title = `${state.exhibitor?.companyName || state.exhibitor?.name || "Exhibitor profile"} — EventSphere`;
  }, [state.exhibitor]);

  return <PublicPageShell>
    <main className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
      <Link to="/event-listing" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[var(--public-teal)]"><ArrowLeft size={16} /> Back to events</Link>
      {state.loading ? <EllipsisLoader scope="page" label="Loading exhibitor" /> : state.error ? (
        <div className="rounded-xl border bg-white p-6">
          <p role="alert">{state.error}</p>
          <button className="action-button mt-4" onClick={() => { setState({ loading: true }); setRevision(value => value + 1); }}>Try again</button>
        </div>
      ) : <>
        <header className="rounded-2xl border bg-white p-6 sm:p-8">
          <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-[var(--public-teal)]"><Building2 className="size-5" /> Exhibitor profile</p>
          <h1 className="font-serif text-3xl sm:text-4xl">{state.exhibitor.companyName || state.exhibitor.name}</h1>
          {state.exhibitor.companyName && <p className="mt-2 text-[var(--public-copy)]">Managed by {state.exhibitor.name}</p>}
          {state.profiles.length === 0 && <p className="mt-4 text-sm text-[var(--public-copy)]">This exhibitor has not added a public company description or contact details yet.</p>}
        </header>
        {state.profiles.length > 0 && <section className="mt-6 grid gap-4 md:grid-cols-2" aria-label="Company details">
          {state.profiles.map(profile => <article key={profile._id} className="min-w-0 rounded-xl border bg-white p-5 [overflow-wrap:anywhere]">
            <h2 className="font-serif text-xl">{profile.companyName}</h2>
            <p className="mt-1 text-sm font-medium text-[var(--public-teal)]">{profile.category}</p>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-6">{profile.description}</p>
            {profile.products && <div className="mt-4"><h3 className="text-sm">Products & services</h3><p className="mt-1 whitespace-pre-wrap text-sm">{profile.products}</p></div>}
            <dl className="mt-4 space-y-2 text-sm">
              {profile.contactEmail && <div className="flex items-center gap-2"><dt><Mail className="size-4" aria-label="Email" /></dt><dd><a href={`mailto:${profile.contactEmail}`} className="underline">{profile.contactEmail}</a></dd></div>}
              {profile.phone && <div className="flex items-center gap-2"><dt><Phone className="size-4" aria-label="Phone" /></dt><dd>{profile.phone}</dd></div>}
              {publicWebsite(profile.website) && <div className="flex items-center gap-2"><dt><Globe className="size-4" aria-label="Website" /></dt><dd><a href={publicWebsite(profile.website)} target="_blank" rel="noreferrer" className="underline">{profile.website}</a></dd></div>}
            </dl>
            <p className="mt-4 border-t pt-3 text-sm">Exhibiting at <Link className="font-semibold underline" to={`/expos/${profile.event._id}`}>{profile.event.title}</Link>{profile.boothNumber ? ` · Booth ${profile.boothNumber}` : ""}</p>
          </article>)}
        </section>}
        <section className="mt-10">
          <h2 className="mb-5 font-serif text-2xl">Events managed by this exhibitor</h2>
          {state.events.length ? <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{state.events.map((event, index) => <EventCard key={event._id} event={event} index={index} />)}</div> : <p className="rounded-xl border bg-white p-6 text-sm">No published events are available yet.</p>}
        </section>
      </>}
    </main>
  </PublicPageShell>;
}
