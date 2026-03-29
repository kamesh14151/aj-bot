This is the [assistant-ui](https://github.com/assistant-ui/assistant-ui) starter project.

## Environment Variables

Set at least one of these variables:

```
GEMINI_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
GOOGLE_GENERATIVE_AI_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

`app/api/chat/route.ts` accepts either variable and uses Gemini `gemini-2.5-flash-lite`.

## Getting Started

Create `.env.local` from `.env.example` and add your key.

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Deploy To Vercel

In Vercel Project Settings -> Environment Variables, add one of:

- `GEMINI_API_KEY`
- `GOOGLE_GENERATIVE_AI_API_KEY`

Then redeploy the latest commit.
