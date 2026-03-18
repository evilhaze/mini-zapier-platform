FROM node:20-alpine

WORKDIR /app

# Prisma needs DATABASE_URL for datasource parsing during `prisma generate`.
# Provide a safe placeholder; override this ENV at runtime with the real DATABASE_URL.
ARG DATABASE_URL="postgresql://postgres:postgres@localhost:5432/zyper?schema=public"
ENV DATABASE_URL=$DATABASE_URL

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run db:generate
RUN npm run build

EXPOSE 3001

CMD ["sh", "-c", "npm run db:generate && npm run db:deploy && npm run start"]