# ---- Dependencies stage (cached unless package.json changes) ----
FROM node:18-alpine AS deps
WORKDIR /app
COPY package.json ./
RUN npm ci && npm cache clean --force

# ---- Final stage ----
FROM node:18-alpine

# Install Chromium and system deps in ONE layer (reduces image size)
RUN apk add --no-cache chromium nss freetype harfbuzz ca-certificates ttf-freefont \
    && rm -rf /var/cache/apk/*

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
EXPOSE 3001
CMD ["node", "app.js"]
