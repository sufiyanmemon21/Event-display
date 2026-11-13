import ImageWithSkeleton from "@/components/ImageWithSkeleton";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import LandingNavigation from "@/components/landing/LandingNavigation";
import planningImage from "@/assets/last.avif";

export default function AuthLayout({ title, description, children, photoBackground = false }) {
  useEffect(() => {
    document.title = title + " — EventSphere";
  }, [title]);

  return (
    <div
      className="public-theme celebration-auth min-h-dvh [background:var(--public-paper)] text-[var(--public-ink)]
                   [&_footer]:[background-color:#352722]! [&_:focus-visible]:[outline-color:#247d78]
                   [&:has(.celebration-nav)_>_main:not(.celebration-page)]:pt-[max(104px,_7vw)]
                   [&_>_main:has([data-loading-scope='page'])]:flex [&_>_main:has([data-loading-scope='page'])]:min-h-svh
                   [&_>_main:has([data-loading-scope='page'])]:flex-col [&_>_main_div:has(>_[data-loading-scope='page'])]:flex
                   [&_>_main_div:has(>_[data-loading-scope='page'])]:flex-1
                   [&_>_main_div:has(>_[data-loading-scope='page'])]:flex-col
                   [&_>_main_div:has(>_[data-loading-scope='page'])]:w-full [color-scheme:light]"
      id="top"
    >
      {!photoBackground && <LandingNavigation />}
      <main
        className={photoBackground ? "relative isolate grid min-h-dvh items-center px-4 py-8 sm:px-8 sm:py-12" : `celebration-auth-main [.public-theme.celebration-auth_>_&]:grid
          [.public-theme.celebration-auth_>_&]:items-center [.public-theme.celebration-auth_>_&]:min-h-dvh
          [.public-theme.celebration-auth_>_&]:p-[110px_clamp(16px,_5vw,_64px)_40px]
          [.public-theme.celebration-auth_>_&]:[background:radial-gradient(ellipse_at_15%_22%,_#fffaf0_0,_transparent_48%),_radial-gradient(ellipse_at_89%_68%,_#edcfad80_0,_transparent_42%),_linear-gradient(145deg,_#f9eee4_0%,_#f0ddd1_65%,_#f7ebe1_100%)]`}
      >
        {photoBackground && <>
          <ImageWithSkeleton src={planningImage} alt="" aria-hidden="true" className="absolute inset-0 -z-20 h-full w-full object-cover object-center" fetchPriority="high" />
          <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[#30201a]/45" />
        </>}
        <div
          className={photoBackground ? "mx-auto w-full max-w-[560px] overflow-hidden rounded-2xl border border-white/60 bg-[#fffaf6]/95 shadow-2xl backdrop-blur-sm" : `celebration-auth-spread grid [grid-template-columns:1fr_1fr] w-[min(100%,_1080px)] mx-auto overflow-hidden
          [border:1px_solid_#e2c9bd] rounded-[18px] [background:#fffaf6]
          [box-shadow:0_28px_70px_#51311f23,_0_3px_10px_#51311f12] max-[760px]:[grid-template-columns:1fr]
          max-[760px]:max-w-[490px]`}
        >
          {!photoBackground && <div
            className="celebration-auth-photo relative isolate grid items-end min-h-[500px] p-[clamp(26px,_4vw,_56px)]
          [background:#69534b] [&_.auth-photo-image]:absolute [&_.auth-photo-image]:inset-0 [&_.auth-photo-image]:w-full [&_.auth-photo-image]:h-full [&_.auth-photo-image]:z-[-2]
          [&_.auth-photo-image]:object-cover [&::after]:absolute [&::after]:inset-0 [&::after]:w-full [&::after]:h-full
          [&::after]:content-[''] [&::after]:z-[-1]
          [&::after]:[background:linear-gradient(transparent_35%,_rgb(42_25_19_/_83%))] [&_p]:text-[#fff6f0]
          [&_p]:[font:clamp(2rem,_3.5vw,_3.6rem)/1.04_Georgia,_serif] [&_em]:text-[#f3ccba] max-[760px]:min-h-[165px]
          max-[760px]:p-5 max-[760px]:[&_.auth-photo-image]:[object-position:center_60%]"
            aria-hidden="true"
          >
            <ImageWithSkeleton src={planningImage} alt="" className="auth-photo-image" fetchPriority="high" />
            <p>
              Beautifully planned.
              <br />
              <em>Joyfully celebrated.</em>
            </p>
          </div>}
          <section
            className="celebration-auth-panel self-center min-w-0 p-[clamp(26px,_4vw,_56px)] text-[var(--account-ink)]
          [&_p:not([role='alert'])]:text-[var(--account-copy)] [&_a:not([data-slot='button'])]:text-[var(--account-accent-hover)]
          [&_a]:underline-offset-[4px] [&_a:not([data-slot='button']):hover]:underline [&_label]:text-[var(--account-ink)] [&_label]:text-[.84rem]
          [&_label]:font-[550] [&_input]:w-full [&_input]:min-w-0 [&_input]:min-h-[44px] [&_input]:p-[9px_12px]
          [&_input]:[border:1px_solid_#d8baad] [&_input]:rounded-[7px] [&_input]:[background:#fffdfb]
          [&_input]:text-[var(--account-ink)] [&_input]:text-[1rem] [&_select]:w-full [&_select]:min-w-0
          [&_select]:min-h-[44px] [&_select]:p-[9px_12px] [&_select]:[border:1px_solid_#d8baad] [&_select]:rounded-[7px]
          [&_select]:[background:#fffdfb] [&_select]:text-[var(--account-ink)] [&_select]:text-[1rem]
          [&_input::placeholder]:text-[#826f67] [&_a:focus-visible]:[outline:2px_solid_var(--account-accent)]
          [&_a:focus-visible]:outline-offset-2 [&_button:focus-visible]:[outline:2px_solid_var(--account-accent)]
          [&_button:focus-visible]:outline-offset-2 [&_input:focus-visible]:[outline:2px_solid_var(--account-accent)]
          [&_input:focus-visible]:outline-offset-2 [&_select:focus-visible]:[outline:2px_solid_var(--account-accent)]
          [&_select:focus-visible]:outline-offset-2 max-[760px]:p-[clamp(18px,_5vw,_32px)]"
            aria-labelledby="account-title"
          >
            <Link
              to="/"
              className="celebration-auth-back inline-flex items-center gap-2 text-[.82rem]"
            >
              <ArrowLeft size={16} /> Back to EventSphere
            </Link>
            <header
              className="celebration-auth-heading my-[22px] [&_h1]:my-[7px_10px] [&_h1]:text-[var(--account-ink)]
          [&_h1]:[font:clamp(2.35rem,_4vw,_3.6rem)/1.02_Georgia,_serif] [&_h1]:tracking-[-.04em] [&_p]:text-[.9rem]
          [&_p]:leading-[1.55]"
            >
              <p
                className="celebration-auth-kicker [.celebration-auth-heading_&]:text-[var(--account-accent)]
          [.celebration-auth-heading_&]:text-[.7rem] [.celebration-auth-heading_&]:font-[650]
          [.celebration-auth-heading_&]:tracking-[.15em] [.celebration-auth-heading_&]:uppercase"
              >
                Your EventSphere account
              </p>
              <h1 id="account-title">{title}</h1>
              <p>{description}</p>
            </header>
            {children}
          </section>
        </div>
      </main>
    </div>
  );
}
