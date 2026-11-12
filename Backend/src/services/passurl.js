const defaultWebsite = "https://event-display-frontend.vercel.app";

export function passVerificationUrl(token, configured = process.env.PUBLIC_WEBSITE_URL) {
  const website = new URL(configured || defaultWebsite);
  if (website.protocol !== "https:" || website.username || website.password || website.hostname === "localhost" || website.hostname.endsWith(".localhost") || /^[0-9.]+$/.test(website.hostname) || website.hostname.includes(":")) {
    throw new Error("PUBLIC_WEBSITE_URL must be the public HTTPS website address.");
  }
  const url = new URL("/passes/verify", website.origin);
  url.hash = token;
  return url;
}
