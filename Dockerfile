FROM node:20-alpine AS build
WORKDIR /app

# install deps
COPY package*.json ./
RUN npm ci

# copy sources
COPY . .

# build
RUN npm run build

FROM node:20-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production

# Make the runtime port explicit for container platforms
EXPOSE 80

# copy built artifacts and node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY package*.json ./
COPY --from=build /app/drizzle.config.ts ./
COPY --from=build /app/src/db/schema ./src/db/schema
COPY --from=build /app/drizzle ./drizzle

# optional: run migrations at container startup if RUN_MIGRATIONS env var is set
CMD if [ "$RUN_MIGRATIONS" = "1" ]; then npm run migrate; fi && node dist/main.js
