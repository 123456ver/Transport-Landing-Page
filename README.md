# SwiftLink Kenya - Optimized Build

## ⚡ SPEED FIXES APPLIED

### 1. BuildKit Enabled
```bash
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1
```

### 2. .dockerignore Added
Prevents copying `node_modules`, `.git`, frontend files into build context.

### 3. Multi-Stage Backend Build
Only production dependencies in final image. Smaller, faster.

### 4. WhatsApp Service Layer Caching
System deps (Chromium) installed in one layer. `node_modules` cached unless `package.json` changes.

### 5. npm ci + Cache Clean
Faster than `npm install` and removes cache to shrink image.

---

## Quick Start

```bash
# First run (slow - downloads everything)
chmod +x setup.sh
./setup.sh
cd kenyatransport
docker-compose up --build

# After first build (FAST - uses cache)
docker-compose up

# Skip WhatsApp for even faster preview (edit docker-compose.yml first)
# Comment out the whatsapp-service block, then:
docker-compose up
```

## Local Access Points

| Service | URL |
|---------|-----|
| Website | http://localhost |
| Backend API | http://localhost:3000 |
| MailHog | http://localhost:8025 |
| WhatsApp Status | http://localhost:3001/status |

## Deploy to Render.com

```bash
./deploy-to-render.sh
```

Follow the printed instructions to push to GitHub and connect Render.
