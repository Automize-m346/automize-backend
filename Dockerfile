FROM node:20-alpine AS build
WORKDIR /app

# install deps
COPY package*.json ./
RUN npm ci

# copy sources
COPY . .
# generate prisma client during build so TypeScript can import @prisma/client
RUN npm run prisma:generate

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

# copy prisma schema & generated client into runtime image
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma

# copy a small entrypoint to improve runtime diagnostics
COPY ./scripts/docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

# entrypoint will optionally run migrations then start the Node app
CMD ["sh", "./docker-entrypoint.sh"]
