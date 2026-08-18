# Sind & Sind

A React, Tailwind and Express e-commerce decision-support product.

## Stack

- React + React Router for the multi-page interface
- Tailwind CSS v4 for styling
- Vite for the frontend build and development server
- Node.js + Express for the `/api/advice` endpoint
- A local JavaScript playbook library as the initial knowledge base

## Run locally

Install the current Node.js LTS release first, then run:

```bash
npm install
npm run dev
```

Open `http://localhost:5173`. Vite serves the React app and proxies `/api` requests to Express on port `5174`.

## Build and deploy

```bash
npm run build
npm start
```

`npm start` serves the built `dist` folder and the API from the same Express service. This can be deployed as one Node service on Render or Railway.

For a split deployment, host `dist` on Vercel and the `server/` service on Render/Railway. Set `VITE_API_URL` to the deployed API origin during the frontend build and `CLIENT_ORIGIN` to the deployed frontend origin on the server.

## Knowledge base

The initial playbooks live in `server/data/playbooks.js`. Move them to Supabase or another database when you need editing tools, analytics, versioning, or a larger searchable library.
