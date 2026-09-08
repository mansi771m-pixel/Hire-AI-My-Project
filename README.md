<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Hire-AI — My-Project-Hire-AI-

An AI Interview Intelligence Agent and Recruitment Platform with resume parsing, interactive AI screening interviews, candidate scorecards, and interview scheduling. Built with React, Vite, and an Express backend.

## Run Locally

Prerequisites: Node.js (recommended >=16), npm

1. Install dependencies:
   ```bash
   npm ci
   ```
2. Copy `.env.example` to `.env` and set secrets (do NOT commit `.env`):
   ```bash
   cp .env.example .env
   # then edit .env and set GEMINI_API_KEY, APP_URL as needed
   ```
3. Run dev server (backend + Vite middleware):
   ```bash
   npm run dev
   ```

The server runs at `http://127.0.0.1:3000/` by default.

## Developer Notes (Permanent)

- Local dev URL: `http://127.0.0.1:3000/`
- Frontend is deployed to Vercel (see repo About → Website for the public URL).
- When you deploy the backend later, set the frontend environment variable `APP_URL` to your backend public URL so the client can call the API.

Steps to deploy backend later (recommended: Render):

1. Push your changes to GitHub (`main` branch).
2. Create a Web Service on Render and connect your GitHub repo.
   - Build command: `npm ci && npm run build`
   - Start command: `npm start`
3. Add environment variables in Render (e.g., `GEMINI_API_KEY`).
4. After Render provides a public backend URL (e.g., `https://your-backend.onrender.com`), add `APP_URL=https://your-backend.onrender.com` in Vercel Project → Settings → Environment Variables and redeploy the frontend.

## License

Add a license file (e.g., MIT) if you want to open-source this project.

---
Updated developer notes added.
