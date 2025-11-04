# Build stage
FROM node:18-alpine AS build-stage

# Set working directory
WORKDIR /app

# Install curl for health checks and other utilities
RUN apk add --no-cache curl

# Copy package files first for better layer caching
COPY package*.json ./

# Install dependencies including dev dependencies for build
RUN npm ci --ignore-scripts

# Copy environment files if they exist (optional)
# Note: This step will be skipped if no .env files exist

# Copy the entire project
COPY . ./

# Set build-time environment variables for Next.js build
ENV NEXT_PUBLIC_SUPABASE_URL=https://xhwurctmoubmzsgybpmu.supabase.co
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhod3VyY3Rtb3VibXpzZ3licG11Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyNDg3MjQsImV4cCI6MjA2OTgyNDcyNH0.-CATWf8WbxsKjs-emID2ZMU8547gEXhXjB2g46Pm7ys

# Build the Next.js app
RUN npm run build

# Production stage
FROM node:18-alpine AS production-stage

# Install curl for healthcheck
RUN apk add --no-cache curl

# Set working directory
WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -u 1001 -S nextjs -G nodejs

# Copy package.json for production dependencies
COPY --from=build-stage --chown=nextjs:nodejs /app/package*.json ./

# Install only production dependencies
RUN npm ci --only=production --ignore-scripts && npm cache clean --force

# Copy built Next.js app from build stage
COPY --from=build-stage --chown=nextjs:nodejs /app/.next ./.next
COPY --from=build-stage --chown=nextjs:nodejs /app/public ./public
COPY --from=build-stage --chown=nextjs:nodejs /app/next.config.js ./next.config.js

# Create simple health check endpoint
RUN mkdir -p /app/public && echo "OK" > /app/public/health.txt

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Set Supabase environment variables (override with actual values at runtime)
ENV NEXT_PUBLIC_SUPABASE_URL=https://xhwurctmoubmzsgybpmu.supabase.co
# Using service role key temporarily for development - replace with proper anon key for production
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhod3VyY3Rtb3VibXpzZ3licG11Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyNDg3MjQsImV4cCI6MjA2OTgyNDcyNH0.-CATWf8WbxsKjs-emID2ZMU8547gEXhXjB2g46Pm7ys

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/health.txt || exit 1

# Switch to non-root user
USER nextjs

# Expose port 3000
EXPOSE 3000

# Start Next.js server
CMD ["npm", "run", "start"]