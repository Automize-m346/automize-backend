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

# copy built artifacts and node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY package*.json ./

# optional: run migrations at container startup if RUN_MIGRATIONS env var is set
CMD if [ "$RUN_MIGRATIONS" = "1" ]; then npx drizzle-kit migrate --apply --schema ./src/db/schema --url "mysql://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}"; fi && node dist/main.js
