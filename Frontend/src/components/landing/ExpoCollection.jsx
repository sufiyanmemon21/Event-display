import { CardGridSkeleton } from "@/components/LoadingSkeletons";
import { useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, Search } from "lucide-react";
import EventCard from "./EventCard";

export default function ExpoCollection({
  data,
  kind = "expos",
  limit,
  title = kind === "events" ? "Events" : "Expos",
  eyebrow,
  description,
}) {
  const preview = typeof limit === "number";
  const Heading = preview ? "h2" : "h1";
  const [query, setQuery] = useState("");
  const items = data.items.filter((item) =>
    [item.title, item.location, item.theme]
      .join(" ")
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  const displayedItems = preview ? items.slice(0, limit) : items;
  return (
    <section
      className={
        preview
          ? "border-t border-[var(--public-line)] py-10 sm:py-14"
          : "py-16 sm:py-20"
      }
      id={`catalog-${kind}`}
      aria-labelledby={`catalog-${kind}-title`}
    >
      <div className="mx-auto w-[min(1240px,calc(100%_-_3rem))]">
        <div className="mb-9 text-center">
          <div>
            {eyebrow && (
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-[var(--public-teal)]">
                {eyebrow}
              </p>
            )}
            <Heading
              id={`catalog-${kind}-title`}
              className="font-serif text-3xl font-semibold text-[var(--public-ink)] sm:text-4xl"
            >
              {title}
            </Heading>
          </div>
          {description && (
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[var(--public-copy)]">
              {description}
            </p>
          )}
        </div>
        {!preview && (
          <label
            className="mx-auto mb-8 flex max-w-xl items-center gap-3 rounded-full border border-[var(--public-line)] bg-white px-5
          py-2.5 text-[#6e625d] shadow-sm [&_input]:min-w-0 [&_input]:w-full [&_input]:bg-transparent [&_input]:p-1
          [&_input]:outline-none"
          >
            <Search size={20} />
            <span className="sr-only">Search {kind}</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by name, theme, or location"
            />
          </label>
        )}
        {data.loading ? (
          <CardGridSkeleton label="Finding your next experience" image count={limit ?? 3} />
        ) : data.error ? (
          <div
            className="flex min-h-48 flex-col items-center justify-center gap-4 rounded-2xl border border-[var(--public-line)] bg-white p-8 text-center text-[var(--public-copy)]"
            role="alert"
          >
            <CalendarDays />
            <h3>We'll be right back.</h3>
            <p>{data.error}</p>
            <button
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[var(--public-teal)] px-6 py-3 text-sm
          text-white hover:bg-[var(--public-teal-dark)] focus-visible:outline-[#9a7026]"
              onClick={data.retry}
            >
              Try again
            </button>
          </div>
        ) : items.length ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {displayedItems.map((item, index) => (
              <EventCard key={item._id} event={item} index={index} />
            ))}
          </div>
        ) : (
          <div className="flex min-h-48 flex-col items-center justify-center gap-4 rounded-2xl border border-[var(--public-line)] bg-white p-8 text-center text-[var(--public-copy)]">
            <CalendarDays />
            <h3>{query ? `No matching ${kind}.` : `No ${kind} listed yet.`}</h3>
            <p>
              {query
                ? "Try another name, theme, or location."
                : `New ${kind} will appear here as organizers publish them.`}
            </p>
          </div>
        )}
        {preview && (
          <div className="mt-8 text-center">
            <Link
              to={kind === "events" ? "/event-listing" : "/expos"}
              className="celebration-button inline-flex items-center justify-center gap-3 min-h-[44px] p-[9px_18px] rounded-[6px]
          [background:var(--accent)] text-[#fffaf6] text-[.83rem] font-semibold [transition:background-color_.18s_ease]
          hover:[background:#694239] [.celebration-extras_>_&]:rounded-[999px] [.celebration-extras_>_&]:px-6"
            >
              View all {kind}
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
