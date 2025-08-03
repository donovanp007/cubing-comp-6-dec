# Multi-stage Docker build for Next.js CRM app
# This Dockerfile is designed to be run from the repository root

# Build stage
FROM node:18-alpine AS build-stage

# Set working directory
WORKDIR /app

# Install curl and other utilities
RUN apk add --no-cache curl

# Copy package files from the cubing-hub-crm directory
COPY cubing-hub-crm/package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci --ignore-scripts

# Copy the entire cubing-hub-crm project
COPY cubing-hub-crm/ ./

# Build the Next.js application
RUN npm run build

# Production stage
FROM node:18-alpine AS production-stage

# Install curl for health checks
RUN apk add --no-cache curl

# Set working directory
WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -u 1001 -S nextjs -G nodejs

# Copy package.json for production dependencies
COPY --from=build-stage --chown=nextjs:nodejs /app/package*.json ./

# Install only production dependencies
RUN npm ci --only=production --ignore-scripts && npm cache clean --force

# Copy built application from build stage
COPY --from=build-stage --chown=nextjs:nodejs /app/.next ./.next

# Copy public directory if it exists
COPY --from=build-stage --chown=nextjs:nodejs /app/public ./public

# Copy Next.js config
COPY --from=build-stage --chown=nextjs:nodejs /app/next.config.js ./next.config.js

# Create health check endpoint
RUN mkdir -p /app/public && echo "OK" > /app/public/health.txt

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Supabase configuration (set these in Coolify environment variables)
ENV NEXT_PUBLIC_SUPABASE_URL=https://supabasekong-c4kg0sokgkw40w8wgwgcg8gk.thecubinghub.com
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc1MTAxNjY2MCwiZXhwIjo0OTA2NjkwMjYwLCJyb2xlIjoic2VydmljZV9yb2xlIn0.iJt_FyaAsB6vuJ7VFV50m609fv8Pci8k5Qn4uvpNqZc

# Health check configuration
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/health.txt || exit 1

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Start the Next.js application
CMD ["npm", "run", "start"]