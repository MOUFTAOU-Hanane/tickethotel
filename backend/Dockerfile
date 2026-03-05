FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

FROM node:20-alpine AS production
RUN addgroup -S app && adduser -S app -G app
WORKDIR /app
COPY package*.json ./
RUN npm install --only=production
COPY --from=builder /app/src ./src
RUN chown -R app:app /app
USER app
EXPOSE 3000
ENV NODE_ENV=production
HEALTHCHECK --interval=30s --timeout=10s CMD wget -qO- http://localhost:3000/api/v1/health || exit 1
CMD ["node", "src/index.js"]