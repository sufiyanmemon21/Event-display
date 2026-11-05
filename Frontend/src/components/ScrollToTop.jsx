import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

const publicPaths = new Set([
  "/",
  "/contact",
  "/event-listing",
  "/gallery",
  "/event-gallery",
  "/expos",
  "/service",
  "/services",
  "/login",
  "/signup",
  "/register",
  "/forget",
  "/reset",
  "/otp",
  "/dashboard/login",
  "/dashboard/signup",
  "/dashboard/forget-password",
  "/dashboard/otp",
  "/dashboard/reset",
]);

export default function ScrollToTop() {
  const { pathname, hash } = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    const isPublicRoute =
      publicPaths.has(pathname) || pathname.startsWith("/expos/");

    if (!isPublicRoute || hash || navigationType === "POP") return;

    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname, hash, navigationType]);

  return null;
}
