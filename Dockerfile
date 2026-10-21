# Toko merchandise + konfigurator Studio Seragam (SvelteKit, adapter-node)
# Bangun di server tujuan: docker compose build

# ── Build ──
FROM node:22-bookworm-slim AS build
WORKDIR /app
# Alat kompilasi untuk modul native (better-sqlite3) bila binary siap pakai tidak tersedia
RUN apt-get update \
	&& apt-get install -y --no-install-recommends python3 make g++ \
	&& rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json .npmrc ./
RUN npm ci
COPY . .
RUN npm run build && npm prune --omit=dev

# ── Runtime ──
FROM node:22-bookworm-slim
ENV NODE_ENV=production \
	PORT=3000 \
	DATA_DIR=/data \
	MIGRATIONS_DIR=/app/drizzle \
	BODY_SIZE_LIMIT=10M
WORKDIR /app
COPY --from=build /app/build ./build
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/drizzle ./drizzle
RUN mkdir -p /data && chown node:node /data
USER node
VOLUME /data
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
	CMD node -e "fetch('http://127.0.0.1:3000/shop',{headers:{'x-forwarded-proto':'https'}}).then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "build"]
