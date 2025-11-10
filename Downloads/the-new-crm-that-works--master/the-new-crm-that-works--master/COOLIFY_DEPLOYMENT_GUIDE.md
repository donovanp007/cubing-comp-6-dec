# Coolify Deployment Guide - CRM Application

## Overview
This guide provides step-by-step instructions to deploy the CRM application on Coolify.

## Prerequisites
- Coolify instance running and accessible
- GitHub repository with code pushed: `https://github.com/donovanp007/the-new-crm-that-works`
- Supabase account and database configured
- Domain name (optional but recommended)

---

## Step 1: Prepare Your Supabase Database

### 1.1 Create the Database Tables
1. Go to your Supabase dashboard
2. Open the SQL Editor
3. Run the migration script: `COMPLETE_DATABASE_SETUP.sql`
4. Run the RLS policy fix: `FIX_RLS_FOR_DEV.sql`

### 1.2 Get Your Credentials
From Supabase Dashboard > Settings > API:
- Copy your **Project URL** (e.g., `https://your-project.supabase.co`)
- Copy your **Anon Key** (public key for front-end)
- Save these for Step 3

---

## Step 2: Create Coolify Application

### 2.1 Connect GitHub Repository
1. Log in to your Coolify instance
2. Click **+ New** → **Application**
3. Select **Docker** as deployment method
4. Choose **Git Repository**
5. Connect your GitHub account and select: `donovanp007/the-new-crm-that-works`
6. Select branch: `master`
7. Click **Save**

### 2.2 Configure Build Settings
1. In the application settings, go to **Build**
2. Set the following:
   - **Dockerfile**: `./Dockerfile`
   - **Docker Compose File**: (leave empty - we use Dockerfile)
   - **Build Context**: `./`
   - **Base Image** (optional): `node:18-alpine`

---

## Step 3: Set Environment Variables in Coolify

### 3.1 Add Environment Variables
In Coolify, go to **Application Settings** → **Environment Variables** and add:

```
NODE_ENV=production
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
PORT=3000
HOSTNAME=0.0.0.0
```

**Replace with your actual values:**
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key

### 3.2 Verify Variables
Double-check that all environment variables are set correctly. Coolify will use these during build and runtime.

---

## Step 4: Configure Port & Health Check

### 4.1 Port Configuration
1. Go to **Application Settings** → **Ports**
2. Configure the port:
   - **Container Port**: `3000`
   - **Public Port**: `80` (or your preferred port)
   - **Protocol**: `HTTP`

### 4.2 Health Check
1. Go to **Application Settings** → **Health Check**
2. Set:
   - **Path**: `/health`
   - **Interval**: `30s`
   - **Timeout**: `10s`
   - **Start Period**: `10s`
   - **Max Retries**: `3`

---

## Step 5: Deploy

### 5.1 Build & Deploy
1. Click **Deploy** button
2. Coolify will:
   - Clone your repository
   - Build the Docker image using the Dockerfile
   - Start the container
   - Run health checks

### 5.2 Monitor Deployment
- Check the **Deployment Log** for any errors
- Wait for health checks to pass (green status)
- Application should be accessible at your configured URL

### 5.3 Verify Application
Once deployed:
1. Visit your application URL
2. You should see the login/dashboard page
3. Check that students and schools load from Supabase

---

## Step 6: Configure Domain (Optional)

### 6.1 Add Custom Domain
1. In Coolify, go to **Application Settings** → **Domains**
2. Add your custom domain (e.g., `crm.yourdomain.com`)
3. Point your domain DNS to Coolify's IP
4. Coolify will automatically issue an SSL certificate

---

## Troubleshooting

### Issue: Build Fails
**Solution**: Check the build log for errors. Common issues:
- Missing environment variables: Make sure all `NEXT_PUBLIC_*` variables are set
- Node version mismatch: Verify you're using Node 18+
- Dependencies issue: Clear and rebuild

**Command to check in Coolify logs:**
```
npm ci
npm run build
```

### Issue: Application Starts But Won't Load Data
**Possible Causes:**
1. Supabase credentials are incorrect
2. RLS policies are not updated (run `FIX_RLS_FOR_DEV.sql`)
3. Network connectivity to Supabase

**Solution:**
- Verify environment variables in Coolify match your Supabase credentials
- Check Supabase network access isn't blocked
- Review browser console (F12) for CORS errors

### Issue: Health Check Failing
**Solution**: Health check is looking for `/health` endpoint. Make sure:
- Port 3000 is correctly exposed
- Application is fully started (wait 10+ seconds)
- No firewall blocking the port

---

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Node environment | `production` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | `https://xyz.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | `eyJ0eXAiOiJKV1Q...` |
| `PORT` | Application port | `3000` |
| `HOSTNAME` | Bind address | `0.0.0.0` |

---

## Performance Optimization (Optional)

### Recommended Coolify Settings:
1. **CPU Limit**: `1` CPU
2. **Memory Limit**: `512MB`
3. **Auto-restart**: Enabled
4. **Automatic Updates**: Enable for security patches
5. **Backup**: Enable daily backups if available

---

## Monitoring & Maintenance

### 1. Monitor Logs
- Coolify → Application → Logs
- Check for errors or warnings

### 2. Monitor Resources
- Coolify → Application → Statistics
- Monitor CPU, Memory, and Network usage

### 3. Update Application
To update after code changes:
1. Push code to GitHub (master branch)
2. In Coolify, click **Redeploy**
3. Coolify automatically pulls latest code and rebuilds

---

## Security Checklist

- [ ] Environment variables are set correctly
- [ ] Supabase RLS policies are configured
- [ ] HTTPS/SSL is enabled (Coolify handles this)
- [ ] Custom domain is configured
- [ ] Database backups are enabled
- [ ] Review Supabase security settings

---

## Support & Additional Resources

- **Coolify Docs**: https://coolify.io/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Supabase Docs**: https://supabase.com/docs

---

## Next Steps After Deployment

1. **Add Sample Data** (Optional):
   - Run the sample data SQL scripts from `supabase-migrations/` folder
   - This populates test data for development

2. **Configure Production Security**:
   - Update RLS policies from `public` to `authenticated` when ready
   - Implement proper user authentication

3. **Set Up Monitoring**:
   - Configure error tracking (e.g., Sentry)
   - Set up uptime monitoring
   - Enable application logs

4. **Backup Strategy**:
   - Regular Supabase backups
   - Application data backups

---

## FAQ

**Q: Can I use a different Supabase instance?**
A: Yes, update the `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` environment variables.

**Q: How do I scale the application?**
A: In Coolify, increase CPU/Memory limits under Application Settings → Resources.

**Q: Can I use a database other than Supabase?**
A: The application is built specifically for Supabase. Major changes would be required.

**Q: How often should I deploy updates?**
A: Whenever you push code to the master branch, click Redeploy in Coolify (or enable auto-deploy).

---

Last Updated: 2025-11-10
