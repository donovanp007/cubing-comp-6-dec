# Build stage
FROM node:18-alpine as build-stage

# Set working directory
WORKDIR /app

# Set Supabase environment variables for production build
ENV VITE_SUPABASE_URL=https://gdiilyynpyscctdozlit.supabase.co
ENV VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdkaWlseXlucHlzY2N0ZG96bGl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2NTkwMTYsImV4cCI6MjA2ODIzNTAxNn0.yoXR6zGoQ8f53u0qxZ73ld6T-5z_u-NhrKxDXKySt9c

# Install curl for health checks and other utilities
RUN apk add --no-cache curl

# Copy package files first for better layer caching
COPY package*.json ./
COPY package-lock.json ./

# Use npm install instead of npm ci for more flexibility
RUN npm install

# Copy environment files if they exist
COPY .env* ./

# Copy project files
COPY . .

# Build the app (Vite will use .env.production if available)
RUN npm run build

# Production stage
FROM nginx:stable-alpine as production-stage

# Install curl for healthcheck
RUN apk add --no-cache curl

# Create directories if they don't exist
RUN mkdir -p /var/cache/nginx /var/log/nginx /var/run

# Create non-root user and set permissions
RUN addgroup -g 1001 -S appgroup && \
    adduser -u 1001 -S appuser -G appgroup

RUN chown -R appuser:appgroup /var/cache/nginx && \
    chown -R appuser:appgroup /var/log/nginx && \
    chown -R appuser:appgroup /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown -R appuser:appgroup /var/run/nginx.pid

# Copy built assets from build stage
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Create simple health check file
RUN echo "OK" > /usr/share/nginx/html/health

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/health || exit 1

# Permissions for nginx directories
RUN chmod -R 755 /usr/share/nginx/html

# Switch to non-root user
USER appuser

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
