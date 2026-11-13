# EventSphere API

## Environment

Set MONGODB_URL and JWT_SECRET in the backend environment. PORT defaults to 3000. PUBLIC_WEBSITE_URL sets the public HTTPS origin for QR passes and defaults to https://event-display-frontend.vercel.app.

Set the frontend VITE_API_URL to the API origin. Rebuild the frontend after changing it. Its development fallback is http://localhost:3000.

## Password recovery

Set EMAIL_USER to the sending Gmail address and EMAIL_PASS to its Gmail app password in the backend environment. An optional RECOVERY_OTP_SECRET can be set to a dedicated random secret shared across backend instances. Otherwise recovery uses JWT_SECRET. Changing the recovery secret invalidates outstanding email codes.

Deploy the backend and frontend together. The frontend uses /forget/request-otp, /forget/verify-otp and /forget/resetPassword on the API origin. Recovery emails contain a code, so FRONTEND_URL is no longer needed for recovery.

On Vercel, keep system environment variables available so the backend can use VERCEL and register the SMTP send with waitUntil. MongoDB must permit creation of the recoveryrates collection and its expiresAt TTL index. The database enforces the 60-second resend cooldown, five guesses per code, and request limits across instances.

The request endpoint acknowledges requests uniformly for privacy. Monitor backend logs for delivery failures and check an actual mailbox after deploying. The code and reset authorization each expire after 10 minutes.

## Website logo

Logo uploads are stored as WebP data in MongoDB's websitebrandings collection. They do not depend on local files or browser storage.

- GET /website-settings/logo: saved logo metadata
- GET /website-settings/logo/image: image
- PUT /website-settings/logo: replace logo using the multipart logo field; Admin only
- DELETE /website-settings/logo: restore default branding; Admin only

Logo responses use no-store caching. Navbar, footer, sidebar and settings share the saved branding. Older browser-only logos must be uploaded through Website Settings to become persistent.

## Booking passes

Each QR links to /passes/verify with a signed booking reference. Each booking has a unique ID; repeated downloads retain that identity. Preview and download use the same PDF renderer.

The public website must connect to the backend containing the booking, with the same JWT_SECRET used to issue the pass. Previously downloaded passes retain their old URL; download them again after changing the public website address.

## Checks

Run npm run check:syntax and npm test from this directory. Tests use isolated model substitutes and do not require writing records to a live database.
