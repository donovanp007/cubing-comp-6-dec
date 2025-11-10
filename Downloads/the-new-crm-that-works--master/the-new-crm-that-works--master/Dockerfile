# ============================================================================
# CRM APPLICATION DOCKERFILE - OPTIMIZED FOR COOLIFY
# ============================================================================

# Build stage - compiles Next.js application
FROM node:18-alpine AS build

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache curl python3 make g++

# Copy package files - handles nested Coolify directory structure
# Docker COPY follows this logic:
# If package.json exists at root of build context, copy it
# If not found, Docker will fail with clear error
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci || { echo "ERROR: npm ci failed. Check that package-lock.json exists in repository root."; exit 1; }

# Copy entire project
COPY . .

# Build Next.js application
# Note: Environment variables can be overridden at build time if needed
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
RUN npm ci --only=production && npm cache clean --force

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