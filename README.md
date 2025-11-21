Date Ideas Near Me — Local-first Expo app

Quick start

1. Install dependencies

```bash
npm install
```

2. Start Expo

```bash
npm run start
# or
# npm run ios
# npm run android
```

Backend (serverless proxies)

- This project includes two serverless API functions in `/backend/api`:
  - `/api/places` — proxies Google Places Nearby Search
  - `/api/ideas` — calls OpenAI to generate short date ideas

- Deploy on Vercel (recommended free tier):

```bash
npm i -g vercel
vercel
```

- Make sure to set these environment variables in the Vercel project settings:
  - `GOOGLE_PLACES_API_KEY`
  - `OPENAI_API_KEY`

- After deployment, set `API_URL` in the Expo app config or update `src/services/api.ts` to point to your deployment, e.g. `https://your-project.vercel.app/api`.

Mock / Offline mode

- The app ships with a deterministic offline mock mode to avoid any external API calls or billing.
- By default the app uses mock mode when `expo.extra.API_URL` is empty or when `src/services/api.ts` has `USE_MOCK_API = true`.
- To run in mock mode (recommended for local dev):

```bash
npm install
npx expo start
```

Switching to the real backend

- When you're ready to use the real backend and AI features, follow these steps:

1. Deploy the `/backend` folder to Vercel (or run it locally with `vercel dev`).
2. In the Vercel project settings, add the environment variables shown in `backend/.env.example` (`OPENAI_API_KEY`, `GOOGLE_PLACES_API_KEY`).
3. Set `expo.extra.API_URL` in `app.json` to your deployed backend URL (for example `https://your-project.vercel.app/api`).
4. In `src/services/api.ts` set `USE_MOCK_API = false` and restart the app.

Notes about secrets and API keys

- Do not store server-side secrets (like `OPENAI_API_KEY`) in client-side code or `app.json` — keep them in your serverless function environment (Vercel settings).
- The client only needs `API_URL` to point to your backend. The backend reads `OPENAI_API_KEY` from its environment and will call the OpenAI API.

Local dev for backend

- You can run the backend locally with Vercel dev from the repo root:

```bash
vercel dev
```

Notes
- The app uses mocked data if the API_URL placeholder is not replaced, so you can develop without keys.
- Do not commit secrets to the repo.

Manual smoke tests (after `expo start`)

- Explore (Map):
  1. Open the app and grant location permission when prompted.
  2. Verify the map centers on your location and markers appear.
  3. Tap the filter slider icon to open filters, change radius/budget, and Apply — markers should refresh.
  4. Tap a pin — a detail sheet should appear with Save / Did this / Open in Maps actions.

- Ideas (AI):
  1. Open Ideas tab. Default mood/budget should load from Settings (Profile) if set.
  2. Select Mood, Duration, Budget and tap Generate Ideas.
  3. If backend is configured the AI will return 3–5 ideas; otherwise mock/fallback ideas appear.
  4. Save an idea and mark one as Done — verify they appear in Memories or Favorites.

- Memories:
  1. Open Memories tab — saved memories should appear grouped by recency.
  2. Use pull-to-refresh to reload the list.

- Profile / Settings:
  1. Open Profile and set Default Mood, Budget and Radius.
  2. Save Preferences, then return to Ideas/Explore and verify defaults are applied.

If anything fails, check the device logs in the Metro console or Vercel function logs (if using deployed backend).