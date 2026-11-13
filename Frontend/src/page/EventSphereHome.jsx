import ImageWithSkeleton from "@/components/ImageWithSkeleton";
import { validateContactForm, clearContactValidity } from "@/lib/contactValidation";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  ArrowUpRight,
  ArrowUp,
  Building2,
  Cake,
  Flower2,
  Heart,
  Images,
  Music2,
  Trees,
} from "lucide-react";
import HeroSection from "@/components/landing/HeroSection";
import PublicPageShell from "@/components/landing/PublicPageShell";
import ExpoCollection from "@/components/landing/ExpoCollection";
import useExpos, { isExpo } from "@/hooks/useExpos";
import birthdayImage from "@/assets/birthday.avif";
import weddingImage from "@/assets/wedding.avif";
import gardenImage from "@/assets/last.avif";
import receptionImage from "@/assets/Main.jpg";
import concertImage from "@/assets/live concerts.avif";
import LandingExtras from "@/components/landing/LandingExtras";

const occasions = [
  {
    name: "Birthdays",
    icon: Cake,
    photo: birthdayImage,
    alt: "Pink balloon garland and birthday cake",
  },
  {
    name: "Showers",
    icon: Flower2,
    photo: gardenImage,
    alt: "Garden celebration with bright floral arrangements",
  },
  {
    name: "Weddings",
    icon: Heart,
    photo: weddingImage,
    alt: "Neutral outdoor wedding ceremony setting",
  },
  {
    name: "Corporate events",
    icon: Building2,
    photo: receptionImage,
    alt: "Reception tables set for a formal gathering",
  },
  {
    name: "Live events",
    icon: Music2,
    photo: concertImage,
    alt: "Blue-lit stage at a live music event",
  },
  {
    name: "Outdoor gatherings",
    icon: Trees,
    photo: gardenImage,
    alt: "Rows of gold chairs along a garden aisle",
  },
];

const packages = ["Classic", "Signature", "Bespoke"];
const galleryPreview = occasions.filter(({ name }) =>
  ["Birthdays", "Weddings", "Live events"].includes(name),
);

function openInquiry(event) {
  event.preventDefault();
  if (!validateContactForm(event.currentTarget)) return;
  const form = new FormData(event.currentTarget);
  const subject = encodeURIComponent(
    `EventSphere inquiry · ${form.get("package") || "General inquiry"}`,
  );
  const body = encodeURIComponent(
    `Name: ${form.get("name")}\nEmail: ${form.get("email")}\n\n${form.get("message")}`,
  );
  window.location.href = `mailto:hello@eventsphere.com?subject=${subject}&body=${body}`;
}

export default function EventSphereHome() {
  const { hash, key } = useLocation();
  const [occasion, setOccasion] = useState("");
  const catalog = useExpos();
  const latest = catalog.items;
  const expoItems = latest.filter(isExpo);
  const eventItems = latest.filter((item) => !isExpo(item));
  const photos = occasion
    ? occasions.filter(({ name }) => name === occasion)
    : occasions.slice(0, 4);

  useEffect(() => {
    document.title = "EventSphere — Events & Celebrations";
    if (!hash) return;
    const frame = requestAnimationFrame(() =>
      document.getElementById(hash.slice(1))?.scrollIntoView(),
    );
    return () => cancelAnimationFrame(frame);
  }, [hash, key]);

  return (
    <PublicPageShell>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-white focus:p-4"
      >
        Skip to content
      </a>
      <main
        id="main-content"
        className="celebration-page [&_a:focus-visible]:[outline:2px_solid_#8d574b] [&_a:focus-visible]:outline-offset-4
          [&_button:focus-visible]:[outline:2px_solid_#8d574b] [&_button:focus-visible]:outline-offset-4
          [&_input:focus-visible]:[outline:2px_solid_#8d574b] [&_input:focus-visible]:outline-offset-4
          [&_select:focus-visible]:[outline:2px_solid_#8d574b] [&_select:focus-visible]:outline-offset-4
          [&_textarea:focus-visible]:[outline:2px_solid_#8d574b] [&_textarea:focus-visible]:outline-offset-4
          [background:var(--cream)] text-[var(--ink)] [color-scheme:light] [scroll-margin-top:95px]
          [&_section[id]]:[scroll-margin-top:95px] [&_h1]:font-serif [&_h1]:font-normal [&_h1]:text-[var(--ink)]
          [&_h1]:tracking-[-.035em] [&_h1]:text-[clamp(3rem,_5.8vw,_5.6rem)] [&_h1]:leading-[.99] [&_h2]:font-serif
          [&_h2]:font-normal [&_h2]:text-[var(--ink)] [&_h2]:tracking-[-.035em] [&_h3]:font-serif [&_h3]:font-normal
          [&_h3]:text-[var(--ink)] [&_h3]:tracking-[-.035em] [&_h2]:text-[clamp(2.1rem,_4vw,_4rem)] [&_h2]:leading-[1.06]
          [&_h3]:text-[clamp(1.55rem,_2.4vw,_2.3rem)] [&_h3]:leading-[1.12] [&_em]:text-[var(--accent)]
          [&_em]:font-normal [&_p]:text-[var(--muted)] [&_p]:leading-[1.65]
          max-[640px]:[&_h1]:text-[clamp(2.55rem,_9vw,_4rem)]"
        tabIndex={-1}
      >
        <HeroSection />

        <section
          id="gallery"
          className="celebration-wrap celebration-gallery w-[min(1200px,_calc(100%_-_72px))] mx-auto max-[640px]:w-[calc(100%_-_32px)] pt-4"
          aria-label="Celebration gallery"
        >
          <div
            className="celebration-occasions grid grid-cols-6 gap-2 mb-[15px] [&_button]:flex [&_button]:min-h-[78px]
          [&_button]:flex-col [&_button]:items-center [&_button]:justify-center [&_button]:gap-[7px] [&_button]:p-[6px]
          [&_button]:[border:1px_solid_transparent] [&_button]:rounded-[9px] [&_button]:text-[#77554a]
          [&_button]:text-[.68rem] [&_button]:font-semibold [&_button]:tracking-[.05em] [&_button]:text-center
          [&_button]:uppercase [&_button:hover]:border-[#ddc0b3] [&_button:hover]:[background:#f5e5dc]
          [&_button[aria-pressed='true']]:border-[#ddc0b3] [&_button[aria-pressed='true']]:[background:#f5e5dc]
          max-[640px]:grid-cols-3 max-[640px]:[&_button]:min-h-[62px]"
            role="group"
            aria-label="Filter gallery by occasion"
          >
            {occasions.map(({ name, icon: Icon }) => (
              <button
                key={name}
                type="button"
                aria-pressed={occasion === name}
                aria-controls="occasion-photos"
                onClick={() => setOccasion(occasion === name ? "" : name)}
              >
                <Icon size={25} strokeWidth={1.2} aria-hidden="true" />
                {name}
              </button>
            ))}
          </div>
          <div
            id="occasion-photos"
            className={`celebration-photos grid grid-cols-4 gap-[10px] [&.is-filtered]:grid-cols-2 max-[640px]:grid-cols-2${occasion ? " is-filtered" : ""}`}
          >
            {photos.map(({ name, photo, alt }) => (
              <figure key={name} tabIndex={0} className="group relative m-0 overflow-hidden rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#87584d]">
                <ImageWithSkeleton src={photo} alt={alt} loading="lazy" className="block h-[clamp(170px,22vw,290px)] w-full object-cover max-[640px]:h-[clamp(125px,37vw,200px)]" />
                <span aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#1e1411]/80 via-transparent to-transparent transition-opacity duration-300 group-hover:opacity-0 group-focus-visible:opacity-0 motion-reduce:transition-none" />
                <span aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[#241813]/55 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none" />
                <figcaption className="absolute bottom-3 left-3 max-w-[calc(100%-24px)] text-[.76rem] font-medium text-white transition-[left,bottom,translate,font-size] duration-300 ease-out group-hover:bottom-1/2 group-hover:left-1/2 group-hover:-translate-x-1/2 group-hover:translate-y-1/2 group-hover:text-center group-hover:text-xl group-focus-visible:bottom-1/2 group-focus-visible:left-1/2 group-focus-visible:-translate-x-1/2 group-focus-visible:translate-y-1/2 group-focus-visible:text-center group-focus-visible:text-xl motion-reduce:transition-none">{name}</figcaption>
              </figure>
            ))}
            {occasion && (
              <div className="celebration-gallery-note self-center p-5 [&_h2]:mb-3 max-[640px]:p-[7px] max-[640px]:[&_h2]:text-[1.5rem]">
                <p
                  className="celebration-kicker [.celebration-page_&]:text-[var(--accent)] [.celebration-page_&]:mb-3
          [.celebration-page_&]:text-[.71rem] [.celebration-page_&]:leading-[1.4] [.celebration-page_&]:tracking-[.16em]
          [.celebration-page_&]:uppercase [.celebration-page_&]:font-[650]"
                >
                  In the gallery
                </p>
                <h2>{occasion}</h2>
                <button
                  type="button"
                  className="celebration-text-link inline-flex items-center gap-2 text-[#75493d] underline underline-offset-[4px] text-[.84rem] font-semibold"
                  onClick={() => setOccasion("")}
                >
                  Show all occasions <Images size={16} />
                </button>
              </div>
            )}
          </div>
        </section>

        <section
          id="about"
          className="celebration-wrap celebration-intro w-[min(1200px,_calc(100%_-_72px))] mx-auto max-[640px]:w-[calc(100%_-_32px)]
          py-[clamp(32px,_6vw,_76px)] grid [grid-template-columns:1fr_1fr] items-center gap-[clamp(22px,_6vw,_90px)]
          [&_>_div_>_p:not(.celebration-kicker)]:max-w-[43ch] [&_>_div_>_p:not(.celebration-kicker)]:m-[16px_0_20px]
          [&_>_.eventsphere-image]:w-full [&_>_.eventsphere-image]:h-[clamp(220px,_28vw,_340px)] [&_>_.eventsphere-image]:object-cover [&_>_.eventsphere-image]:rounded-[18px]
          max-[640px]:[grid-template-columns:1fr]"
          aria-labelledby="about-title"
        >
          <div>
            <p
              className="celebration-kicker [.celebration-page_&]:text-[var(--accent)] [.celebration-page_&]:mb-3
          [.celebration-page_&]:text-[.71rem] [.celebration-page_&]:leading-[1.4] [.celebration-page_&]:tracking-[.16em]
          [.celebration-page_&]:uppercase [.celebration-page_&]:font-[650]"
            >
              Events and celebrations
            </p>
            <h2 id="about-title">
              About <em>EventSphere</em>
            </h2>
            <p>
              EventSphere brings attendees, organizers, and exhibitors together.
              Discover local events and expos, check what’s happening, and book
              a place when you’re ready.
            </p>
            <p>
              Planning a gathering of your own? Explore ideas for birthdays,
              weddings, and corporate events, then share your plans with us
              through the inquiry form.
            </p>
          </div>
          <ImageWithSkeleton
            src={receptionImage}
            alt="Tables set with flowers for a formal reception"
            loading="lazy"
          />
        </section>

        <ExpoCollection
          data={{ ...catalog, items: eventItems }}
          kind="events"
          limit={3}
        />
        <ExpoCollection
          data={{ ...catalog, items: expoItems }}
          kind="expos"
          limit={3}
        />

        <LandingExtras photos={galleryPreview} />

        <section
          id="inquire"
          className="celebration-wrap celebration-inquiry w-[min(1200px,_calc(100%_-_72px))] mx-auto
          max-[640px]:w-[calc(100%_-_32px)] [&_>_div_>_p:not(.celebration-kicker)]:max-w-[43ch]
          [&_>_div_>_p:not(.celebration-kicker)]:m-[16px_0_20px] grid [grid-template-columns:1fr_.8fr_1fr] items-center
          gap-[22px] py-[clamp(30px,_5vw,_65px)] [&_>_.eventsphere-image]:w-full [&_>_.eventsphere-image]:min-h-[240px] [&_>_.eventsphere-image]:h-full [&_>_.eventsphere-image]:max-h-[410px]
          [&_>_.eventsphere-image]:rounded-[12px] [&_>_.eventsphere-image]:object-cover max-[930px]:[grid-template-columns:1fr_1fr]
          max-[930px]:[&_>_.eventsphere-image]:hidden max-[640px]:[grid-template-columns:1fr]"
          aria-labelledby="inquiry-title"
        >
          <div>
            <p
              className="celebration-kicker [.celebration-page_&]:text-[var(--accent)] [.celebration-page_&]:mb-3
          [.celebration-page_&]:text-[.71rem] [.celebration-page_&]:leading-[1.4] [.celebration-page_&]:tracking-[.16em]
          [.celebration-page_&]:uppercase [.celebration-page_&]:font-[650]"
            >
              Make it yours
            </p>
            <h2 id="inquiry-title">Let’s plan your next gathering.</h2>
            <p>
              Tell us what you have in mind, from the occasion and date to the
              details you already know.
            </p>
          </div>
          <ImageWithSkeleton
            src={receptionImage}
            alt="Tables set with candles and flowers for a reception"
            loading="lazy"
          />
          <form
            onSubmit={openInquiry} onInput={clearContactValidity}
            className="celebration-form min-w-0 grid gap-[10px] p-5 [border:1px_solid_#e2c9bd] rounded-[12px] [background:#fffaf6]
          [&_label]:grid [&_label]:gap-1 [&_label]:text-[var(--ink)] [&_label]:text-[.78rem] [&_input]:min-w-0
          [&_input]:w-full [&_input]:[border:1px_solid_#cfb3a7] [&_input]:rounded-[5px] [&_input]:[background:#fffdfb]
          [&_input]:p-[6px_9px] [&_input]:text-[var(--ink)] [&_select]:min-w-0 [&_select]:w-full
          [&_select]:[border:1px_solid_#cfb3a7] [&_select]:rounded-[5px] [&_select]:[background:#fffdfb]
          [&_select]:p-[6px_9px] [&_select]:text-[var(--ink)] [&_textarea]:min-w-0 [&_textarea]:w-full
          [&_textarea]:[border:1px_solid_#cfb3a7] [&_textarea]:rounded-[5px] [&_textarea]:[background:#fffdfb]
          [&_textarea]:p-[6px_9px] [&_textarea]:text-[var(--ink)] [&_textarea]:resize-y"
          >
            <h3>Send an inquiry</h3>
            <label>
              Your name
              <input name="name" autoComplete="name" required />
            </label>
            <label>
              Email address
              <input type="email" name="email" autoComplete="email" required />
            </label>
            <label>
              Package
              <select name="package">
                <option value="">Help me decide</option>
                {packages.map((name) => (
                  <option key={name}>{name}</option>
                ))}
              </select>
            </label>
            <label>
              Tell us about your event
              <textarea name="message" rows={3} required />
            </label>
            <button
              className="celebration-button inline-flex items-center justify-center gap-3 min-h-[44px] p-[9px_18px] rounded-[6px]
          [background:var(--accent)] text-[#fffaf6] text-[.83rem] font-semibold [transition:background-color_.18s_ease]
          hover:[background:#694239] [.celebration-extras_>_&]:rounded-[999px] [.celebration-extras_>_&]:px-6"
              type="submit"
            >
              Open email draft <ArrowUpRight size={16} />
            </button>
          </form>
        </section>
      </main>
      <button
        type="button"
        aria-label="Back to top"
        title="Back to top"
        onClick={() => window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" })}
        className="fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-5 z-40 grid size-11 place-items-center rounded-full border border-[#d8baad] bg-[#fffaf6] text-[#87584d] shadow-lg transition-colors hover:bg-[#87584d] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#87584d] motion-reduce:transition-none"
      >
        <ArrowUp size={20} aria-hidden="true" />
      </button>
    </PublicPageShell>
  );
}
