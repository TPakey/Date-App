Backend proxy for Date Ideas Near Me

This folder contains two serverless API routes intended for deployment on a free-tier platform like Vercel.

Endpoints
- `GET /api/places?lat=<>&lng=<>&radius=<meters>&type=<google_place_type>&keyword=<>`
  - Proxies Google Places Nearby Search and returns a compact list of places.
  - Environment variable required: `GOOGLE_PLACES_API_KEY`.

- `POST /api/ideas`
  - Accepts `{ places: [...], filters: {...} }` and calls OpenAI to generate 3-5 date ideas.
  - Environment variable required: `OPENAI_API_KEY`.

Deployment (Vercel)
1. Install Vercel CLI (optional): `npm i -g vercel`
2. From this repo root, run `vercel` and follow prompts to deploy.
  - If Vercel prompts for a root directory, select the project root.
3. The `vercel.json` included routes `/api/*` to `/backend/api/*.ts` so endpoints will be available at `https://<your-project>.vercel.app/api/places` and `/api/ideas`.
4. In the Vercel dashboard, set the Environment Variables (Project Settings → Environment Variables):
  - `GOOGLE_PLACES_API_KEY` = your Google Places API key
  - `OPENAI_API_KEY` = your OpenAI API key

Local dev with Vercel CLI
- Install Vercel CLI and run from repo root:

```bash
vercel dev
```

This will run a local development server and route `/api/*` to the functions under `/backend/api`.

If you prefer not to use Vercel locally, you can test the endpoints by setting `API_URL` in the frontend to point to a deployed instance and use `curl` or Postman to call `/api/places` and `/api/ideas`.

Frontend configuration
- Update `src/services/api.ts` -> `API_URL` to point to your deployed Vercel project URL, e.g. `https://your-project.vercel.app/api`.

Notes
- No persistent storage is used in these routes.
- Keep keys secret (do not commit them to git).
- The proxies include CORS and small cache headers to reduce duplicate calls.
