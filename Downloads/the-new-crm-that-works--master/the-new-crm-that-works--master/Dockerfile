# ============================================================================
# CRM APPLICATION DOCKERFILE - OPTIMIZED FOR COOLIFY
# ============================================================================

# Build stage - compiles Next.js application
FROM node:18-alpine AS build

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache curl python3 make g++

# First, try to copy from root level
COPY package*.json ./

# Check if package.json exists, if not find it
RUN if [ ! -f package.json ]; then \
    echo "package.json not found at root. Searching..."; \
    if find / -name "package.json" -type f 2>/dev/null | grep -q "the-new-crm"; then \
      PKGJSON_PATH=$(find / -path "*the-new-crm-that-works*" -name "package.json" -type f 2>/dev/null | head -1); \
      if [ -n "$PKGJSON_PATH" ]; then \
        echo "Found package.json at: $PKGJSON_PATH"; \
        cp "$PKGJSON_PATH" ./package.json; \
        if [ -f "${PKGJSON_PATH%/*}/package-lock.json" ]; then \
          cp "${PKGJSON_PATH%/*}/package-lock.json" ./; \
        fi; \
      fi; \
    fi; \
  fi; \
  if [ ! -f package.json ]; then \
    echo "ERROR: Could not find package.json anywhere!"; \
    echo "Build context contents:"; \
    ls -laR / | head -100; \
    exit 1; \
  fi

# Install all dependencies (including dev dependencies for build)
RUN npm install

# Copy entire project - find the src directory
COPY . .
RUN if [ ! -d src ]; then \
    SRC_PATH=$(find / -path "*the-new-crm-that-works*" -name "src" -type d 2>/dev/null | head -1); \
    if [ -n "$SRC_PATH" ]; then \
      echo "Copying src from: $SRC_PATH"; \
      cp -r "$SRC_PATH" .; \
      find / -path "*the-new-crm-that-works*" \( -name "*.tsx" -o -name "*.ts" -o -name "*.json" -o -name "next.config.js" -o -name "tailwind.config.js" -o -name "postcss.config.js" -o -name "tsconfig.json" -o -name ".next" \) 2>/dev/null | xargs -I {} cp --parents {} . 2>/dev/null || true; \
    fi; \
  fi

# Build Next.js application
RUN npm run build

# ============================================================================
# Production stage - minimal runtime image
# ============================================================================

FROM node:18-alpine AS production

WORKDIR /app

# Install only runtime dependencies (curl for healthchecks)
RUN apk add --no-cache curl dumb-init

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -u 1001 -S nextjs -G nodejs

# Copy package files
COPY --from=build --chown=nextjs:nodejs /app/package*.json ./

# Install production dependencies only
RUN npm install --omit=dev && npm cache clean --force

# Copy built application from build stage
COPY --from=build --chown=nextjs:nodejs /app/.next ./.next
COPY --from=build --chown=nextjs:nodejs /app/public ./public
COPY --from=build --chown=nextjs:nodejs /app/next.config.js ./

# Create health check file
RUN mkdir -p /app/public && echo "OK" > /app/public/health && chmod 644 /app/public/health

# ============================================================================
# Environment Configuration
# ============================================================================

# Production settings
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

# These will be overridden by Coolify environment variables at runtime
# Supabase credentials - SET THESE IN COOLIFY
# ENV NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-url.supabase.co
# ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# ============================================================================
# Health Check
# ============================================================================

HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:${PORT}/health || exit 1

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Use dumb-init to handle signals properly
ENTRYPOINT ["/usr/sbin/dumb-init", "--"]

# Start application
CMD ["npm", "run", "start"]
