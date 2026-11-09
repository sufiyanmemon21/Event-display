import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Lightbulb,
  Mail,
  MessageSquare,
  Send,
  Star,
  TriangleAlert,
  UserRound,
} from "lucide-react";
import PublicPageShell from "@/components/landing/PublicPageShell";
import api from "@/api/api";
import useAuth from "@/hooks/useAuth";
import useExpos, { isExpo } from "@/hooks/useExpos";

const types = [
  ["suggestion", "Suggestion", Lightbulb],
  ["issue", "Report an Issue", TriangleAlert],
  ["review", "Public Review", MessageSquare],
];

export default function PublicFeedback() {
  const user = useAuth();
  const { items } = useExpos();
  const [type, setType] = useState("review");
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    document.title = "Share Your Feedback — EventSphere";
  }, []);

  async function submit(event) {
    event.preventDefault();
    if (saving || message.trim().length < 5) return;
    const fields = new FormData(event.currentTarget);
    setSaving(true);
    setError("");
    try {
      await api.post("/feedback/submit", {
        type,
        rating: rating || undefined,
        event: fields.get("expo"),
        subject: fields.get("subject").trim(),
        message: message.trim(),
      });
      setSent(true);
    } catch (failure) {
      setError(
        failure.response?.data?.msg ||
          "Could not submit feedback. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <PublicPageShell>
      <main
        className="public-feedback p-[120px_44px_76px] [background:#fcfaf6] text-[#302a23] [&_header]:m-[0_auto_42px]
          [&_header]:text-center [&_h1]:m-[8px_0_15px] [&_h1]:[font:700_clamp(2rem,_5vw,_3.35rem)/1.05_Georgia,_serif]
          [&_h1_em]:text-[#a16d12] [&_h1_em]:not-italic [&_header_>_p:last-child]:text-[#675c50]
          max-[540px]:px-[15px_37px]"
      >
        <header>
          <span className="public-feedback-icon inline-grid place-items-center w-[62px] h-[62px] rounded-[17px] [background:#fff2d6] text-[#a16d12]">
            <MessageSquare size={28} aria-hidden="true" />
          </span>
          <p className="public-feedback-kicker mt-5 text-[#916316] uppercase tracking-[.24em] text-[.75rem] font-bold">
            Your feedback matters
          </p>
          <h1>
            Share Your <em>Feedback</em>
          </h1>
          <p>Share a review, send a suggestion, or report an issue.</p>
        </header>
        {!user ? (
          <Link
            className="public-feedback-submit flex items-center justify-center gap-2 min-h-[48px] p-[10px_16px] rounded-[11px]
          [background:#946411] text-[white] font-bold hover:[background:#7d510b] disabled:opacity-[.65]
          [.public-feedback_>_a&]:w-fit [.public-feedback_>_a&]:mx-auto"
            to="/login"
            state={{ from: "/share-feedback" }}
          >
            Sign in to share feedback
          </Link>
        ) : sent ? (
          <div
            className="public-feedback-card w-[min(740px,_100%)] mx-auto p-[clamp(16px,_4vw,_38px)] [border:1px_solid_#eadfc9]
          rounded-[27px] [background:white] [box-shadow:0_14px_24px_#3929151b] [&_>_fieldset]:grid
          [&_>_fieldset]:gap-[22px] [&_>_fieldset]:min-w-0 [&_label]:grid [&_label]:gap-[7px] [&_label]:text-[.875rem]
          [&_label]:font-semibold [&_label]:min-w-0 [&_legend]:mb-[9px] [&_legend]:text-[.875rem]
          [&_legend]:font-semibold [&_input:not([type='radio'])]:w-full [&_input:not([type='radio'])]:min-w-0
          [&_input:not([type='radio'])]:p-[12px_14px] [&_input:not([type='radio'])]:[border:1px_solid_#eadfc9]
          [&_input:not([type='radio'])]:rounded-[11px] [&_input:not([type='radio'])]:[background:#fdfbf7]
          [&_input:not([type='radio'])]:font-normal [&_select]:w-full [&_select]:min-w-0 [&_select]:p-[12px_14px]
          [&_select]:[border:1px_solid_#eadfc9] [&_select]:rounded-[11px] [&_select]:[background:#fdfbf7]
          [&_select]:font-normal [&_textarea]:w-full [&_textarea]:min-w-0 [&_textarea]:p-[12px_14px]
          [&_textarea]:[border:1px_solid_#eadfc9] [&_textarea]:rounded-[11px] [&_textarea]:[background:#fdfbf7]
          [&_textarea]:font-normal [&_textarea]:resize-y [&_small]:text-[#675c50] [&_small]:font-normal
          [&[role='status']_>_p]:mb-[14px]"
            role="status"
          >
            <p>
              {type === "review"
                ? "Your review was published."
                : "Thank you. Your feedback was submitted."}
            </p>
            <Link
              className="public-feedback-submit flex items-center justify-center gap-2 min-h-[48px] p-[10px_16px] rounded-[11px]
          [background:#946411] text-[white] font-bold hover:[background:#7d510b] disabled:opacity-[.65]
          [.public-feedback_>_a&]:w-fit [.public-feedback_>_a&]:mx-auto"
              to={type === "review" ? "/#reviews" : "/"}
            >
              {type === "review" ? "View Client Reviews" : "Back to home"}
            </Link>
          </div>
        ) : (
          <form
            className="public-feedback-card w-[min(740px,_100%)] mx-auto p-[clamp(16px,_4vw,_38px)] [border:1px_solid_#eadfc9]
          rounded-[27px] [background:white] [box-shadow:0_14px_24px_#3929151b] [&_>_fieldset]:grid
          [&_>_fieldset]:gap-[22px] [&_>_fieldset]:min-w-0 [&_label]:grid [&_label]:gap-[7px] [&_label]:text-[.875rem]
          [&_label]:font-semibold [&_label]:min-w-0 [&_legend]:mb-[9px] [&_legend]:text-[.875rem]
          [&_legend]:font-semibold [&_input:not([type='radio'])]:w-full [&_input:not([type='radio'])]:min-w-0
          [&_input:not([type='radio'])]:p-[12px_14px] [&_input:not([type='radio'])]:[border:1px_solid_#eadfc9]
          [&_input:not([type='radio'])]:rounded-[11px] [&_input:not([type='radio'])]:[background:#fdfbf7]
          [&_input:not([type='radio'])]:font-normal [&_select]:w-full [&_select]:min-w-0 [&_select]:p-[12px_14px]
          [&_select]:[border:1px_solid_#eadfc9] [&_select]:rounded-[11px] [&_select]:[background:#fdfbf7]
          [&_select]:font-normal [&_textarea]:w-full [&_textarea]:min-w-0 [&_textarea]:p-[12px_14px]
          [&_textarea]:[border:1px_solid_#eadfc9] [&_textarea]:rounded-[11px] [&_textarea]:[background:#fdfbf7]
          [&_textarea]:font-normal [&_textarea]:resize-y [&_small]:text-[#675c50] [&_small]:font-normal
          [&[role='status']_>_p]:mb-[14px]"
            onSubmit={submit}
          >
            <fieldset disabled={saving}>
              <div
                className="public-feedback-identity grid grid-cols-2 gap-3 [&_label_>_span]:relative [&_svg]:absolute [&_svg]:top-[13px]
          [&_svg]:left-[13px] [&_svg]:text-[#a16d12] [&_input:not([type='radio'])]:pl-[38px]
          [&_input:not([type='radio'])]:[background:#f6f2eb] max-[540px]:[grid-template-columns:1fr]"
              >
                <label>
                  Your Name
                  <span>
                    <UserRound size={17} aria-hidden="true" />
                    <input value={user.name || ""} readOnly />
                  </span>
                </label>
                <label>
                  Email Address
                  <span>
                    <Mail size={17} aria-hidden="true" />
                    <input value={user.email || ""} readOnly />
                  </span>
                </label>
              </div>
              <fieldset>
                <legend>What would you like to share?</legend>
                <div
                  className="public-feedback-options grid grid-cols-3 gap-3 [&_label]:relative [&_label]:cursor-pointer [&_input]:absolute
          [&_input]:opacity-0 [&_label_span]:flex [&_label_span]:items-center [&_label_span]:justify-center
          [&_label_span]:gap-[6px] [&_label_span]:min-h-[46px] [&_label_span]:p-[7px]
          [&_label_span]:[border:1px_solid_#eadfc9] [&_label_span]:rounded-[11px] [&_label_span]:[background:#fdfbf7]
          [&_label_span]:text-center [&_button]:flex [&_button]:items-center [&_button]:justify-center
          [&_button]:gap-[6px] [&_button]:min-h-[46px] [&_button]:p-[7px] [&_button]:[border:1px_solid_#eadfc9]
          [&_button]:rounded-[11px] [&_button]:[background:#fdfbf7] [&_button]:text-center
          [&_label_input:checked_+_span]:border-[#c49432] [&_label_input:checked_+_span]:[background:#fff2d6]
          [&_label_input:checked_+_span]:text-[#805309] [&_button[aria-pressed='true']]:border-[#c49432]
          [&_button[aria-pressed='true']]:[background:#fff2d6] [&_button[aria-pressed='true']]:text-[#805309]
          [&_label_input:focus-visible_+_span]:[outline:2px_solid_#a16d12]
          [&_label_input:focus-visible_+_span]:outline-offset-2 max-[540px]:gap-[5px] max-[540px]:[&_label_span]:flex-col
          max-[540px]:[&_label_span]:text-[.74rem]"
                >
                  {types.map(([value, label, Icon]) => (
                    <label key={value}>
                      <input
                        type="radio"
                        name="feedback-type"
                        checked={type === value}
                        onChange={() => setType(value)}
                      />
                      <span>
                        <Icon size={16} aria-hidden="true" />
                        {label}
                      </span>
                    </label>
                  ))}
                </div>
                {type === "review" && (
                  <small>
                    Your first name, review, and rating will be public.
                  </small>
                )}
              </fieldset>
              <label>
                Select an Expo (optional)
                <select name="expo">
                  <option value="">Platform feedback / no specific expo</option>
                  {items.filter(isExpo).map((expo) => (
                    <option key={expo._id} value={expo._id}>
                      {expo.title}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Subject (optional)
                <input
                  name="subject"
                  maxLength={120}
                  placeholder="e.g. Add a map of the venue"
                />
              </label>
              <fieldset>
                <legend>How was your experience? (optional)</legend>
                <div
                  className="public-feedback-options public-feedback-ratings grid gap-3 [&_label]:relative [&_label]:cursor-pointer
          [&_input]:absolute [&_input]:opacity-0 [&_label_span]:flex [&_label_span]:items-center
          [&_label_span]:justify-center [&_label_span]:gap-[6px] [&_label_span]:min-h-[46px] [&_label_span]:p-[7px]
          [&_label_span]:[border:1px_solid_#eadfc9] [&_label_span]:rounded-[11px] [&_label_span]:[background:#fdfbf7]
          [&_label_span]:text-center [&_button]:flex [&_button]:items-center [&_button]:justify-center
          [&_button]:gap-[6px] [&_button]:min-h-[46px] [&_button]:p-[7px] [&_button]:[border:1px_solid_#eadfc9]
          [&_button]:rounded-[11px] [&_button]:[background:#fdfbf7] [&_button]:text-center
          [&_label_input:checked_+_span]:border-[#c49432] [&_label_input:checked_+_span]:[background:#fff2d6]
          [&_label_input:checked_+_span]:text-[#805309] [&_button[aria-pressed='true']]:border-[#c49432]
          [&_button[aria-pressed='true']]:[background:#fff2d6] [&_button[aria-pressed='true']]:text-[#805309]
          [&_label_input:focus-visible_+_span]:[outline:2px_solid_#a16d12]
          [&_label_input:focus-visible_+_span]:outline-offset-2 max-[540px]:gap-[5px] max-[540px]:[&_label_span]:flex-col
          max-[540px]:[&_label_span]:text-[.74rem] grid-cols-5 [&_button]:flex-col [&_button]:text-[#916316]
          [&_button]:text-[.8rem]"
                >
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      aria-label={`Rate ${value} out of 5`}
                      aria-pressed={rating === value}
                      onClick={() => setRating(rating === value ? 0 : value)}
                    >
                      <Star
                        size={21}
                        fill={rating >= value ? "currentColor" : "none"}
                        aria-hidden="true"
                      />
                      {value}
                    </button>
                  ))}
                </div>
              </fieldset>
              <label>
                Your Message
                <textarea
                  rows={6}
                  minLength={5}
                  maxLength={2000}
                  required
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="Tell us your idea or experience…"
                />
                <small className="public-feedback-count text-right">
                  {message.length}/2000
                </small>
              </label>
              {error && <p role="alert">{error}</p>}
              <button
                className="public-feedback-submit flex items-center justify-center gap-2 min-h-[48px] p-[10px_16px] rounded-[11px]
          [background:#946411] text-[white] font-bold hover:[background:#7d510b] disabled:opacity-[.65]
          [.public-feedback_>_a&]:w-fit [.public-feedback_>_a&]:mx-auto"
                type="submit"
                disabled={saving || message.trim().length < 5}
              >
                {saving ? "Submitting…" : "Submit Feedback"}{" "}
                <Send size={16} aria-hidden="true" />
              </button>
            </fieldset>
          </form>
        )}
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
          aria-current="page"
        >
          <MessageSquare size={19} aria-hidden="true" /> Feedback
        </Link>
      </main>
    </PublicPageShell>
  );
}
