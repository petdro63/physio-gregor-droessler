FROM node:24-bookworm-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --no-fund --no-audit
COPY . .
RUN npm run build
FROM node:24-bookworm-slim
ENV NODE_ENV=production DEMO_MODE=false HOST=0.0.0.0 PORT=3180 DATA_DIR=/app/data/practice
WORKDIR /app
COPY --from=build /app/package*.json ./
RUN npm ci --omit=dev --no-fund --no-audit && mkdir -p /app/data && chown node:node /app/data
COPY --from=build /app/dist ./dist
COPY --from=build /app/server ./server
COPY --from=build /app/src/*.json ./src/
COPY --from=build /app/src/reference-lookup.ts ./src/reference-lookup.ts
COPY --from=build /app/scripts ./scripts
USER node
EXPOSE 3180
CMD ["npm","start"]
