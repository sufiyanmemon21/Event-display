# Public booking passes

Passes use https://event-display-frontend.vercel.app by default. To change the website, set PUBLIC_WEBSITE_URL to its public HTTPS origin in the backend environment and restart/redeploy the backend. This is separate from FRONTEND_URL, which other features use.

The QR contains a signed booking reference and opens /passes/verify. Each booking has a unique ID; downloading the same booking again retains that identity. Preview and download use the same PDF renderer.

The live frontend must reach the backend containing the booking. The issuing and verifying backend must use the same JWT_SECRET. No database or secret settings are changed by this update. Old downloaded QR codes are unchanged; download the pass again to get the public link.
