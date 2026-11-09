import EllipsisLoader from "@/components/EllipsisLoader";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, ChevronDown, MessageSquare, Quote } from "lucide-react";
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
      {!loadError && !reviews && <EllipsisLoader label="Loading reviews" />}
      {!loadError && reviews?.length === 0 && <p>No client reviews yet.</p>}
      {!!reviews?.length && (
        <div className="celebration-extras-grid grid grid-cols-3 gap-[clamp(12px,_2vw,_24px)] max-[640px]:[grid-template-columns:1fr]">
          {reviews.map(({ _id, name, message: review, rating }) => (
            <figure
              key={_id}
              className="celebration-review grid content-start gap-3 p-[22px] [overflow-wrap:anywhere] [border:1px_solid_#e2c9bd]
          rounded-[14px] [background:#fffaf6] [&_svg]:text-[var(--accent)] [&_figcaption]:text-[var(--accent)]
          [&_blockquote]:whitespace-pre-wrap [&_blockquote]:leading-[1.55] [&_figcaption]:font-[650]"
            >
              <Quote size={23} aria-hidden="true" />
              {rating && (
                <span aria-label={`${rating} out of 5 stars`}>
                  {"★".repeat(rating)}
                  {"☆".repeat(5 - rating)}
                </span>
              )}
              <blockquote>{review}</blockquote>
              <figcaption>{name}</figcaption>
            </figure>
          ))}
        </div>
      )}
    </section>
  );
}

export default function LandingExtras({ photos }) {
  return (
    <>
      <Link
        to="/share-feedback"
        className="celebration-feedback-trigger fixed z-[40] right-0 top-[50%] [translate:0_-50%] [writing-mode:vertical-rl] flex
          items-center gap-[7px] p-[12px_8px] [border:1px_solid_#dfc79f] [border-right:0] rounded-[12px_0_0_12px]
          [background:linear-gradient(150deg,_#fffdf7ef,_#f8e8cbd9)] [backdrop-filter:blur(12px)] text-[#503925]
          [box-shadow:inset_1px_1px_0_#ffffffbf,_0_7px_22px_#523a1828]
          [transition:background-color_.2s_ease,_box-shadow_.2s_ease,_border-color_.2s_ease] tracking-[.035em]
          text-[.86rem] font-bold [&_svg]:text-[#9d6a10] hover:border-[#b68a46]
          hover:[box-shadow:inset_1px_1px_0_#ffffffbf,_0_8px_24px_#523a1840] focus-visible:[outline:2px_solid_#87584d]
          focus-visible:outline-offset-[-4px] max-[700px]:top-[auto]
          max-[700px]:bottom-[max(1rem,_env(safe-area-inset-bottom))] max-[700px]:[translate:none]
          max-[700px]:p-[8px_5px] max-[700px]:text-[.75rem] motion-reduce:transition-none"
      >
        <MessageSquare size={19} aria-hidden="true" /> Feedback
      </Link>
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
          [&_img]:w-full [&_img]:h-[clamp(220px,_24vw,_330px)] [&_img]:object-cover [&_img]:[transition:scale_.35s_ease]
          [&_figure:hover_img]:[scale:1.045] [&_figcaption]:absolute [&_figcaption]:inset-[auto_0_0]
          [&_figcaption]:p-[28px_16px_14px] [&_figcaption]:[background:linear-gradient(transparent,_#30201bec)]
          [&_figcaption]:text-[white] [&_figcaption]:font-semibold motion-reduce:[&_img]:transition-none
          motion-reduce:[&_figure:hover_img]:[scale:none]"
          >
            {photos.map(({ name, photo, alt }) => (
              <figure key={name}>
                <img src={photo} alt={alt} loading="lazy" />
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
