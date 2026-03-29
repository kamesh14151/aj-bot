This project is a Next.js + assistant-ui chatbot widget with a floating launcher, animated open and close transitions, and Gemini 2.5 Flash Lite as the model provider.

Built on top of the [assistant-ui](https://github.com/assistant-ui/assistant-ui) starter.

## Features

- Floating assistant launcher button
- Animated open and close modal transitions
- Chat thread UI using assistant-ui primitives
- Gemini model integration through AI SDK
- Ready to deploy on Vercel

## Environment Variables

Set at least one of these variables in local or hosted environments:

```
GEMINI_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
GOOGLE_GENERATIVE_AI_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

The API route at app/api/chat/route.ts accepts either variable and uses gemini-2.5-flash-lite.

## Getting Started

Copy .env.example to .env.local and add your key.

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

Open [http://localhost:3000](http://localhost:3000) with your browser to see the widget.

Main UI entry points:

- app/page.tsx
- app/assistant.tsx
- components/assistant-ui/assistant-modal.tsx

## Deploy To Vercel

In Vercel Project Settings, add one of these Environment Variables:

- `GEMINI_API_KEY`
- `GOOGLE_GENERATIVE_AI_API_KEY`

Then redeploy the latest commit.

## Security Notes

- Never commit real API keys to git
- Keep .env local and untracked
- Rotate a key immediately if it is shared publicly
