# Website logo deployment

The logo is stored as a bounded WebP buffer in the existing MongoDB database's websitebrandings collection. Uploads never use a server filesystem. No new storage provider or credentials are needed.

Deploy the backend and frontend changes together when ready. No deployment is performed by this change.

Set VITE_API_URL in the frontend deployment environment to the public HTTPS backend base URL (without an /events suffix). Rebuild the frontend after changing this variable; Vite embeds it at build time. The API client is Frontend/src/api/api.js. Without VITE_API_URL the existing client defaults to localhost:3000.

Keep the existing backend MONGODB_URL and JWT_SECRET configuration. To share a logo between local and deployed sites, their configured APIs must use the same intended database. Do not change database configuration solely to copy a logo.

Public GET /website-settings/logo returns hasLogo, filename and version. Public GET /website-settings/logo/image serves the image. PUT /website-settings/logo accepts a multipart logo file and DELETE /website-settings/logo restores default branding; both require an authenticated administrator. Image and metadata responses use no-store; image URLs also include the saved version. Existing API contracts are unchanged.

Previous logos were saved only in browser localStorage and were never uploaded to the backend. Upload the intended logo once using Change Logo and Save Logo after deployment. Existing browser data is not erased or automatically published.

Navbar, footer, sidebar and settings share logo state. Saved changes update that browser immediately; other open clients refresh on focus, live-update notifications or a 60-second interval.

Validation performed locally: frontend lint/build, backend lint/syntax and isolated HTTP integration tests with in-memory model substitutes. Tests cover default state, authentication/role rejection, upload/read, WebP output, invalid/oversized upload preservation, replacement version and deletion. No production database writes or live deployment verification were performed.
