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

Optional typing speed control:

```
CHAT_STREAM_DELAY_MS=28
```

Higher value = slower typing effect. Lower value = faster rendering.

Optional production instruction baseline:

```
ASSISTANT_DEFAULT_SYSTEM_INSTRUCTION=Your global policy for all tenants
ASSISTANT_NAME=Your Bot Name
ASSISTANT_BASE_WEB=yourcompany.com
TAVILY_API_KEY=tvly-xxxxxxxxxxxxxxxxxxxxxxxx
TAVILY_MAX_RESULTS=5
```

`ASSISTANT_NAME` is used as the bot name by default (tenant request can still override it).

`ASSISTANT_BASE_WEB` auto-fetches website content and injects it as additional knowledge context.

If no dataset is provided in request payload, the API can use Tavily to fetch company website content from `ASSISTANT_BASE_WEB`, then upsert that context into Pinecone for the tenant.

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

## Multi-Tenant Knowledge Base (Production)

The chat API now supports tenant-specific system instruction + dataset context.

`POST /api/chat` accepts additional optional fields:

```json
{
	"tenantId": "acme-001",
	"tenantProfile": {
		"companyName": "Acme Inc",
		"assistantName": "Acme Assistant",
		"tone": "professional",
		"language": "English",
		"industry": "FinTech",
		"policyNotes": "Do not provide legal advice."
	},
	"knowledgeBase": [
		{
			"id": "kb-1",
			"title": "Refund Policy",
			"source": "policy.pdf",
			"content": "Customers can request refunds within 30 days..."
		}
	]
}
```

You can also pass tenant id via header:

`x-tenant-id: acme-001`

Behavior:

- Bot prioritizes tenant knowledge for company-specific answers
- If data is missing, it says so and asks for required context
- Avoids hallucinating tenant-specific facts
- If `ASSISTANT_BASE_WEB` is configured, website content is also included as background context

### Pinecone Integration

The API can automatically retrieve tenant-scoped context from Pinecone and inject it into the system instruction.

Required env vars:

```
PINECONE_API_KEY=pcsk_xxxxxxxxxxxxxxxxxxxxx
PINECONE_INDEX_HOST=your-index-xxxxx.svc.us-east1-gcp.pinecone.io
PINECONE_NAMESPACE_PREFIX=tenant-
PINECONE_TOP_K=6
PINECONE_EMBED_MODEL=text-embedding-004
```

How it works:

- Namespace per tenant: `${PINECONE_NAMESPACE_PREFIX}${tenantId}`
- Latest user query is embedded using Gemini embedding model
- Top K Pinecone matches are fetched and appended to `knowledgeBase`
- Final merged context is injected into the production system instruction

Optional per-request override:

```json
{
	"tenantId": "acme-001",
	"pineconeTopK": 8
}
```

Optional per-request Pinecone credentials/config (for customer-specific Pinecone projects):

```json
{
	"tenantId": "acme-001",
	"pineconeConfig": {
		"apiKey": "pcsk_customer_key",
		"indexHost": "customer-index-xxxxx.svc.us-east1-gcp.pinecone.io",
		"namespacePrefix": "tenant-",
		"topK": 8,
		"embedModel": "text-embedding-004"
	}
}
```

Auto-bootstrap flow when dataset is missing:

- Request arrives with `tenantId`
- If no `knowledgeBase` provided and Pinecone returns no context, system fetches website context via Tavily
- Retrieved context is chunked and upserted to tenant namespace in Pinecone
- Query is re-run against Pinecone and used for grounded response
