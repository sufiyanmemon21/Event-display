import ImageWithSkeleton from "@/components/ImageWithSkeleton";
import BookLink from "@/components/landing/BookLink";
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import birthdayImage from "@/assets/birthday.avif";
import venueImage from "@/assets/Main.jpg";
import useAuth from "@/hooks/useAuth";
import useWebsiteBanner from "@/hooks/useWebsiteBanner";

export default function HeroSection() {
  const user = useAuth();
  const { bannerTitle, bannerDescription, bannerButton, bannerImage } =
    useWebsiteBanner();
  if (user?.role === "attendee") {
    const image = bannerImage || venueImage;
    return (
      <section
        id="home"
        className="attendee-hero relative isolate py-[126px_54px] [background:#efe1d1] [&::before]:content-['']
          [&::before]:absolute [&::before]:inset-0 [&::before]:z-[-1]
          before:bg-[linear-gradient(90deg,#f6ece0ed_24%,#f6ece0a8_100%)] max-[720px]:py-[106px_30px]"
        aria-labelledby="celebration-title"
      >
        <ImageWithSkeleton
          src={image}
          fallbackSrc={venueImage}
          alt=""
          fetchPriority="high"
          className="absolute inset-0 -z-2 size-full object-cover"
        />
        <div
          className="celebration-wrap attendee-hero-layout w-[min(1200px,_calc(100%_-_72px))] mx-auto
          max-[640px]:w-[calc(100%_-_32px)] grid [grid-template-columns:minmax(0,_1.25fr)_minmax(0,_.85fr)]
          gap-[clamp(24px,_7vw,_106px)] items-center [&_h1]:max-w-[13ch] [&_h1]:text-[clamp(3rem,_6vw,_5.8rem)]
          [&_>_.eventsphere-image]:w-full [&_>_.eventsphere-image]:h-[clamp(300px,_40vw,_560px)] [&_>_.eventsphere-image]:object-cover
          [&_>_.eventsphere-image]:[border:1px_solid_#fff6ee] [&_>_.eventsphere-image]:rounded-[27px] [&_>_.eventsphere-image]:[box-shadow:0_18px_40px_#4b302426]
          max-[720px]:[grid-template-columns:minmax(0,_1fr)] max-[720px]:[&_>_.eventsphere-image]:h-[clamp(210px,_55vw,_350px)]
          max-[720px]:[&_>_.eventsphere-image]:rounded-[15px] max-[720px]:[&_h1]:text-[clamp(2.6rem,_9vw,_4rem)]"
        >
          <div>
            <p
              className="celebration-kicker [.celebration-page_&]:text-[var(--accent)] [.celebration-page_&]:mb-3
          [.celebration-page_&]:text-[.71rem] [.celebration-page_&]:leading-[1.4] [.celebration-page_&]:tracking-[.16em]
          [.celebration-page_&]:uppercase [.celebration-page_&]:font-[650]"
            >
              Event management platform
            </p>
            <h1 id="celebration-title">
              {bannerTitle || "Find an event worth getting dressed up for."}
            </h1>
            <p className="attendee-hero-copy max-w-[48ch] my-[22px_24px] text-[clamp(1rem,_1.5vw,_1.15rem)]">
              {bannerDescription ||
                "Explore events and expos, book your place, and keep your passes ready in your EventSphere profile."}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                className="celebration-button inline-flex items-center justify-center gap-3 min-h-[44px] p-[9px_18px] rounded-[6px]
          [background:var(--accent)] text-[#fffaf6] text-[.83rem] font-semibold [transition:background-color_.18s_ease]
          hover:[background:#694239] [.celebration-extras_>_&]:rounded-[999px] [.celebration-extras_>_&]:px-6"
                to="/#catalog-events"
              >
                Explore events <ArrowUpRight size={16} />
              </Link>
              <BookLink
                className="celebration-button attendee-hero-secondary inline-flex items-center justify-center gap-3 min-h-[44px]
          p-[9px_18px] rounded-[6px] text-[.83rem] font-semibold [transition:background-color_.18s_ease]
          [.celebration-extras_>_&]:rounded-[999px] [.celebration-extras_>_&]:px-6 [border:1px_solid_#a47a62]
          [background:#fff6ee] text-[#694239] hover:[background:#f3ddd0]"
              >
                {bannerButton || "Book Now"}
              </BookLink>
            </div>
          </div>
          <ImageWithSkeleton
            src={image}
            alt={bannerImage ? "" : "Tables set for an evening reception"}
            fetchPriority="high"
          />
        </div>
      </section>
    );
  }
  return (
    <section
      id="home"
      className="celebration-hero min-h-[clamp(460px,_47vw,_635px)] relative isolate flex items-center p-[120px_0_60px]
          overflow-hidden [background:#f5e4d9] [&::after]:content-[''] [&::after]:absolute [&::after]:inset-0
          [&::after]:z-[-1]
          [&::after]:[background:linear-gradient(90deg,_#f5e4d9_23%,_rgb(245_228_217_/_97%)_31%,_rgb(245_228_217_/_72%)_45%,_transparent_72%)]
          max-[640px]:min-h-[540px] max-[640px]:items-end max-[640px]:p-[0_0_30px]
          max-[640px]:[&::after]:[background:linear-gradient(0deg,_#f5e4d9_25%,_rgb(245_228_217_/_97%)_36%,_rgb(245_228_217_/_75%)_53%,_transparent_77%)]"
      aria-labelledby="celebration-title"
    >
      <ImageWithSkeleton
        className="celebration-hero-photo absolute inset-[0_0_0_auto] w-[73%] h-full object-cover [object-position:center_55%] z-[-2] max-[640px]:w-full max-[640px]:h-[70%] max-[640px]:object-center"
        src={bannerImage || birthdayImage}
        fallbackSrc={birthdayImage}
        alt={
          bannerImage
            ? ""
            : "Pink and ivory balloon décor around a birthday cake table"
        }
        fetchPriority="high"
      />
      <div
        className="celebration-wrap celebration-hero-inner w-[min(1200px,_calc(100%_-_72px))] mx-auto
          max-[640px]:w-[calc(100%_-_32px)] [&_>_p:not(.celebration-kicker)]:max-w-[38ch]
          [&_>_p:not(.celebration-kicker)]:m-[23px_0_25px] max-[640px]:[&_>_p:not(.celebration-kicker)]:m-[13px_0_17px]"
      >
        <p
          className="celebration-kicker [.celebration-page_&]:text-[var(--accent)] [.celebration-page_&]:mb-3
          [.celebration-page_&]:text-[.71rem] [.celebration-page_&]:leading-[1.4] [.celebration-page_&]:tracking-[.16em]
          [.celebration-page_&]:uppercase [.celebration-page_&]:font-[650]"
        >
          EventSphere · Events & celebrations
        </p>
        <h1 id="celebration-title">
          {bannerTitle || (
            <>
              Beautifully planned.
              <br />
              <em>Joyfully celebrated.</em>
            </>
          )}
        </h1>
        <p>
          {bannerDescription ||
            "From intimate celebrations to full-scale expos, bring the people, setting, and details together in one place."}
        </p>
        <Link
          className="celebration-button inline-flex items-center justify-center gap-3 min-h-[44px] p-[9px_18px] rounded-[6px]
          [background:var(--accent)] text-[#fffaf6] text-[.83rem] font-semibold [transition:background-color_.18s_ease]
          hover:[background:#694239] [.celebration-extras_>_&]:rounded-[999px] [.celebration-extras_>_&]:px-6"
          to="/#inquire"
        >
          {bannerButton || "Plan your event"} <ArrowUpRight size={16} />
        </Link>
      </div>
    </section>
  );
}
