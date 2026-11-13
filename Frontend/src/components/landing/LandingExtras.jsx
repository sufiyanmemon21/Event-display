import { CardGridSkeleton } from "@/components/LoadingSkeletons";
import ImageWithSkeleton from "@/components/ImageWithSkeleton";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, ChevronDown, Quote, Star } from "lucide-react";
import api from "@/api/api";

const questions = [
  [
    "How do I book an event?",
    "Select Book Now, sign in with your attendee account, and choose an event on the booking form.",
  ],
  [
    "Where can I find my ticket?",
    "Open your attendee profile to check your booking status and download your QR pass once confirmed.",
  ],
  [
    "Can I get help planning a private celebration?",
    "Use the inquiry form below to tell us your occasion, preferred date, and what you have in mind.",
  ],
  [
    "How do I leave a review?",
    "Sign in and use the floating Feedback button. Your first name and review will appear in Client Reviews.",
  ],
];

function ClientReviews() {
  const [revision, setRevision] = useState(0);
  const [reviews, setReviews] = useState(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    api
      .get("/feedback/reviews", { signal: controller.signal })
      .then(({ data }) => {
        if (controller.signal.aborted) return;
        setReviews(data.reviews);
        setLoadError(false);
      })
      .catch(() => {
        if (!controller.signal.aborted) setLoadError(true);
      });
    return () => controller.abort();
  }, [revision]);

  return (
    <section
      id="reviews"
      className="celebration-wrap celebration-extras w-[min(1200px,_calc(100%_-_72px))] mx-auto
          max-[640px]:w-[calc(100%_-_32px)] grid gap-6 py-[clamp(38px,_6vw,_78px)] [&_>_header]:text-center
          [&_>_a]:justify-self-center [&_>_a]:text-center [&_>_p]:justify-self-center [&_>_p]:text-center"
      aria-labelledby="reviews-title"
    >
      <header>
        <p
          className="celebration-kicker [.celebration-page_&]:text-[var(--accent)] [.celebration-page_&]:mb-3
          [.celebration-page_&]:text-[.71rem] [.celebration-page_&]:leading-[1.4] [.celebration-page_&]:tracking-[.16em]
          [.celebration-page_&]:uppercase [.celebration-page_&]:font-[650]"
        >
          In their words
        </p>
        <h2 id="reviews-title">Client reviews</h2>
      </header>
      {loadError && (
        <p role="status">
          Reviews couldn’t be loaded.{" "}
          <button
            className="celebration-text-link inline-flex items-center gap-2 text-[#75493d] underline underline-offset-[4px] text-[.84rem] font-semibold"
            type="button"
            onClick={() => setRevision((current) => current + 1)}
          >
            Try again
          </button>
        </p>
      )}
      {!loadError && !reviews && <CardGridSkeleton label="Loading reviews" />}
      {!loadError && reviews?.length === 0 && <p>No client reviews yet.</p>}
      {!!reviews?.length && (
        <div className="flex flex-wrap justify-center gap-6">
          {reviews.map(({ _id, name, message: review, rating }) => (
            <figure
              key={_id}
              className="m-0 flex min-h-64 w-full min-w-0 flex-col rounded-2xl border border-[#e7d6ca] bg-[#fffdf9] p-6 shadow-[0_8px_28px_#51311f08] transition-[box-shadow,border-color] duration-200 hover:border-[#c8a685] hover:shadow-[0_12px_32px_#51311f12] sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] only:max-w-xl only:sm:w-full motion-reduce:transition-none sm:p-8"
            >
              <div className="mb-6 flex items-center justify-between gap-4">
                {rating ? (
                  <span className="flex gap-1" role="img" aria-label={`${rating} out of 5 stars`}>
                    {Array.from({ length: 5 }, (_, index) => (
                      <Star key={index} size={16} aria-hidden="true" className={index < rating ? "fill-[#b38946] text-[#b38946]" : "text-[#dfd3c4]"} />
                    ))}
                  </span>
                ) : <span />}
                <Quote size={28} strokeWidth={1.25} className="text-[#c3a98e]" aria-hidden="true" />
              </div>
              <blockquote className="mb-8 flex-1 whitespace-pre-wrap font-serif text-xl leading-relaxed text-[#49352d] [overflow-wrap:anywhere]">{review}</blockquote>
              <figcaption className="flex items-center gap-3 border-t border-[#eee2d7] pt-5">
                <span aria-hidden="true" className="grid size-11 shrink-0 place-items-center rounded-full bg-[#f2e8dc] font-serif text-lg text-[#87584d]">{name?.trim().charAt(0).toUpperCase() || "G"}</span>
                <span className="min-w-0 text-sm font-semibold text-[#69483b] [overflow-wrap:anywhere]">{name}</span>
              </figcaption>
            </figure>
          ))}
        </div>   )}
    </section>
  );
}

export default function LandingExtras({ photos }) {
  return (
    <>
      <section
        id="event-gallery"
        className="celebration-gallery-preview [background:linear-gradient(135deg,_#e9d5ca,_#cdb3a8)]"
        aria-labelledby="gallery-preview-title"
      >
        <div
          className="celebration-wrap celebration-extras w-[min(1200px,_calc(100%_-_72px))] mx-auto
          max-[640px]:w-[calc(100%_-_32px)] grid gap-6 py-[clamp(38px,_6vw,_78px)] [&_>_header]:text-center
          [&_>_a]:justify-self-center [&_>_a]:text-center [&_>_p]:justify-self-center [&_>_p]:text-center"
        >
          <header>
            <p
              className="celebration-kicker [.celebration-page_&]:text-[var(--accent)] [.celebration-page_&]:mb-3
          [.celebration-page_&]:text-[.71rem] [.celebration-page_&]:leading-[1.4] [.celebration-page_&]:tracking-[.16em]
          [.celebration-page_&]:uppercase [.celebration-page_&]:font-[650]"
            >
              Moments from the gallery
            </p>
            <h2 id="gallery-preview-title">Event gallery</h2>
          </header>
          <div
            className="celebration-extras-grid celebration-preview-photos grid grid-cols-3 gap-[clamp(12px,_2vw,_24px)]
          max-[640px]:[grid-template-columns:1fr] [&_figure]:relative [&_figure]:overflow-hidden
          [&_figure]:[border:1px_solid_#fff6ef] [&_figure]:rounded-[18px] [&_figure]:[box-shadow:0_10px_26px_#57342b26]
          [&_.eventsphere-image]:w-full [&_.eventsphere-image]:h-[clamp(220px,_24vw,_330px)] [&_.eventsphere-image]:object-cover [&_img]:[transition:scale_.35s_ease]
          [&_figure:hover_img]:[scale:1.045] [&_figcaption]:absolute [&_figcaption]:inset-[auto_0_0]
          [&_figcaption]:p-[28px_16px_14px] [&_figcaption]:[background:linear-gradient(transparent,_#30201bec)]
          [&_figcaption]:text-[white] [&_figcaption]:font-semibold motion-reduce:[&_img]:transition-none
          motion-reduce:[&_figure:hover_img]:[scale:none]"
          >
            {photos.map(({ name, photo, alt }) => (
              <figure key={name}>
                <ImageWithSkeleton src={photo} alt={alt} loading="lazy" />
                <figcaption>{name}</figcaption>
              </figure>
            ))}
          </div>
          <Link
            className="celebration-button inline-flex items-center justify-center gap-3 min-h-[44px] p-[9px_18px] rounded-[6px]
          [background:var(--accent)] text-[#fffaf6] text-[.83rem] font-semibold [transition:background-color_.18s_ease]
          hover:[background:#694239] [.celebration-extras_>_&]:rounded-[999px] [.celebration-extras_>_&]:px-6"
            to="/gallery"
          >
            Explore more <ArrowUpRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </section>
      <ClientReviews />
      <section
        id="questions"
        className="celebration-questions [background:#f2e3da]"
        aria-labelledby="questions-title"
      >
        <div
          className="celebration-wrap celebration-extras w-[min(1200px,_calc(100%_-_72px))] mx-auto
          max-[640px]:w-[calc(100%_-_32px)] grid gap-6 py-[clamp(38px,_6vw,_78px)] [&_>_header]:text-center
          [&_>_a]:justify-self-center [&_>_a]:text-center [&_>_p]:justify-self-center [&_>_p]:text-center"
        >
          <header>
            <p
              className="celebration-kicker [.celebration-page_&]:text-[var(--accent)] [.celebration-page_&]:mb-3
          [.celebration-page_&]:text-[.71rem] [.celebration-page_&]:leading-[1.4] [.celebration-page_&]:tracking-[.16em]
          [.celebration-page_&]:uppercase [.celebration-page_&]:font-[650]"
            >
              Before you book
            </p>
            <h2 id="questions-title">Questions &amp; answers</h2>
          </header>
          <div
            className="celebration-question-list [&_details]:[border:1px_solid_#e2c9bd] [&_details]:rounded-[14px]
          [&_details]:[background:#fffaf6] w-[min(720px,_100%)] justify-self-center grid gap-[10px] [&_summary]:flex
          [&_summary]:items-center [&_summary]:justify-between [&_summary]:gap-3 [&_summary]:p-[16px_20px]
          [&_summary]:cursor-pointer [&_summary]:font-[650] [&_summary::-webkit-details-marker]:hidden
          [&_summary:focus-visible]:[outline:2px_solid_var(--accent)] [&_summary:focus-visible]:outline-offset-[3px]
          [&_summary:focus-visible]:rounded-[inherit] [&_summary_svg]:flex-none [&_summary_svg]:text-[var(--accent)]
          [&_summary_svg]:[transition:rotate_.2s_ease] [&_details[open]_summary_svg]:[rotate:180deg]
          [&_details_p]:p-[0_20px_17px] motion-reduce:[&_summary_svg]:transition-none"
          >
            {questions.map(([question, answer]) => (
              <details key={question} name="event-questions">
                <summary>
                  {question}
                  <ChevronDown size={19} aria-hidden="true" />
                </summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
