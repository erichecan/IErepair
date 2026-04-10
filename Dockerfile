# ── Build stage ──────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies
COPY ierepair/package.json ierepair/package-lock.json ./
RUN npm ci

# Copy source
COPY ierepair/ .

# Build Next.js (standalone output)
ENV NEXT_TELEMETRY_DISABLED=1
# Placeholder env vars for build-time (real values injected at Cloud Run runtime)
ENV DATABASE_URL=postgresql://placeholder:placeholder@placeholder/placeholder
ENV AUTH_SECRET=placeholder-build-secret
ENV NEXTAUTH_URL=https://ierepair-549968261036.asia-east1.run.app
ENV NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_placeholder

RUN npm run build

# ── Production stage ──────────────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
# Cloud Run sets PORT=8080 automatically
ENV PORT=8080
ENV HOSTNAME=0.0.0.0

# Copy standalone output
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 8080

CMD ["node", "server.js"]
