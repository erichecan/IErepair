# ── Build stage ──────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV DATABASE_URL=postgresql://placeholder:placeholder@placeholder/placeholder
ENV AUTH_SECRET=placeholder-build-secret
ENV NEXTAUTH_URL=https://ierepair-dfd7b2qpra-ew.a.run.app
ENV NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_placeholder
ENV STRIPE_SECRET_KEY=sk_test_placeholder
ENV STRIPE_WEBHOOK_SECRET=whsec_placeholder
ENV UPSTASH_REDIS_REST_URL=https://placeholder.upstash.io
ENV UPSTASH_REDIS_REST_TOKEN=placeholder_token
ENV R2_ENDPOINT=https://placeholder.r2.cloudflarestorage.com
ENV R2_ACCESS_KEY_ID=placeholder
ENV R2_SECRET_ACCESS_KEY=placeholder
ENV R2_BUCKET=placeholder
ENV R2_PUBLIC_URL=https://placeholder.r2.dev

RUN npm run build

# ── Production stage ──────────────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=8080
ENV HOSTNAME=0.0.0.0

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 8080

CMD ["node", "server.js"]
