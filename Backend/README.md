# EventSphere API

## Environment

Keep the existing MONGODB_URL and JWT_SECRET values in the backend environment. PORT defaults to 3000. FRONTEND_URL is used for account recovery links. PUBLIC_WEBSITE_URL sets the public HTTPS origin for QR passes and defaults to https://event-display-frontend.vercel.app.

Set the frontend VITE_API_URL to the API origin. Rebuild the frontend after changing it. Its development fallback is http://localhost:3000.

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
