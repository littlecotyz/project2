# TaskManager Frontend (Vite + React)

Minimal scaffold for the frontend. To run locally:

1. Install dependencies:

```bash
cd frontend/react
npm install
```

2. Start dev server:

```bash
npm run dev
```

3. The dev server will open at `http://localhost:5173` by default.

Notes:
- This is a minimal scaffold containing demo components `LoginWithGoogle`, `TaskList`, and `Notifications`.
- Configure a proxy or set `VITE_` env vars if your backend runs on a different port.

Google Sign-In
- To enable the Google Sign-In button/one-tap, set your Google OAuth client id as an env var named `VITE_GOOGLE_CLIENT_ID`.
- Example on Windows (PowerShell):

```powershell
setx VITE_GOOGLE_CLIENT_ID "YOUR_GOOGLE_CLIENT_ID"
# restart terminal after setx
```

- In development you can also create a `.env` file in `frontend/react` with:

```
VITE_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
```

The `Login` page will render the Google Sign-In button if `VITE_GOOGLE_CLIENT_ID` is present; otherwise a manual token paste fallback remains.
React example: `LoginWithGoogle.jsx`

Usage:
- Include Google's Identity Services script in your HTML:
```html
<script src="https://accounts.google.com/gsi/client" async defer></script>
```
- Replace `<YOUR_GOOGLE_CLIENT_ID>` with your client id, and ensure the same client id
 is allowed by the server (`GOOGLE_OAUTH_CLIENT_IDS` env).
- The component posts `id_token` to `/api/auth/google/`.
