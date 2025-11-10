# CRM Application - Coolify Deployment Checklist

## Pre-Deployment: Local Testing

### 1. Test Locally with Docker
```bash
# Navigate to project folder
cd the-new-crm-that-works--master

# Build Docker image
docker build -t crm-app:latest .

# Run container locally
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-url.supabase.co \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key \
  crm-app:latest
```

### 2. Verify Application
- [ ] Visit http://localhost:3000
- [ ] Application loads without errors
- [ ] Students page accessible
- [ ] Schools page accessible
- [ ] Data loads from Supabase (run FIX_RLS_FOR_DEV.sql first)

### 3. Test Health Check
- [ ] Health check endpoint responds: `curl http://localhost:3000/health`
- [ ] Docker container shows healthy status

---

## Supabase Preparation

### 1. Database Setup
- [ ] Create Supabase project (or use existing)
- [ ] Run `COMPLETE_DATABASE_SETUP.sql` in SQL Editor
- [ ] Run `FIX_RLS_FOR_DEV.sql` in SQL Editor (for development)

### 2. Get Credentials
From Supabase Dashboard > Settings > API:
- [ ] Copy **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- [ ] Copy **Anon Key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Save these values securely

### 3. Verify Connection
```bash
# Test Supabase connectivity
curl "https://YOUR_SUPABASE_URL/rest/v1/schools?limit=1" \
  -H "apikey: YOUR_ANON_KEY"
```
Should return: `[]` (empty array is OK)

---

## GitHub Repository

### 1. Verify Code is Pushed
- [ ] Code pushed to `master` branch
- [ ] Latest commits visible on GitHub
  - `97fa28cf` - Coolify deployment config
  - `467544cb` - Database fetching fix
- [ ] Repository: `https://github.com/donovanp007/the-new-crm-that-works`

### 2. Key Files Present
- [ ] ✓ `Dockerfile` - Production-ready Docker image
- [ ] ✓ `docker-compose.yml` - Local testing compose file
- [ ] ✓ `COOLIFY_DEPLOYMENT_GUIDE.md` - Detailed deployment guide
- [ ] ✓ `.env.example` - Environment variable reference
- [ ] ✓ `package.json` - Dependencies
- [ ] ✓ `src/` - Application source code
- [ ] ✓ `public/` - Static assets

---

## Coolify Setup

### 1. Create Application in Coolify
- [ ] Log in to Coolify instance
- [ ] Click **+ New** → **Application**
- [ ] Select **Docker** → **Git Repository**
- [ ] Connect GitHub account
- [ ] Select: `donovanp007/the-new-crm-that-works`
- [ ] Select branch: `master`

### 2. Configure Build Settings
- [ ] **Dockerfile**: `./Dockerfile`
- [ ] **Build Context**: `./`
- [ ] **Base Image**: `node:18-alpine` (optional)

### 3. Set Environment Variables
In Coolify → Application → Environment Variables:
```
NODE_ENV=production
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
PORT=3000
HOSTNAME=0.0.0.0
```

✓ **CRITICAL**: Double-check these values match your Supabase credentials

### 4. Configure Port
- [ ] **Container Port**: `3000`
- [ ] **Public Port**: `80` (or custom port)
- [ ] **Protocol**: `HTTP`

### 5. Configure Health Check
- [ ] **Path**: `/health`
- [ ] **Interval**: `30s`
- [ ] **Timeout**: `10s`
- [ ] **Start Period**: `10s`
- [ ] **Max Retries**: `3`

---

## Deployment

### 1. Initial Build & Deploy
- [ ] Click **Deploy** button in Coolify
- [ ] Monitor the deployment log
- [ ] Wait for build to complete (5-10 minutes typical)
- [ ] Wait for health checks to pass (green status)

### 2. Verify Deployment Status
- [ ] Application shows "Running" status
- [ ] Health check shows passing
- [ ] No errors in deployment log
- [ ] Container logs show no critical errors

### 3. Test Live Application
- [ ] Visit your application URL
- [ ] Application loads without errors
- [ ] UI is responsive
- [ ] Can navigate between pages

### 4. Test Data Loading
- [ ] Check browser console (F12) for errors
- [ ] Verify students/schools load from Supabase
- [ ] If no data loads:
  - Verify Supabase URL/Key in environment variables
  - Verify RLS policies are configured
  - Check Supabase network access

---

## Post-Deployment Verification

### 1. Application Features
- [ ] Login page accessible
- [ ] Dashboard loads
- [ ] Students list loads
- [ ] Schools list loads
- [ ] Can create new student/school
- [ ] Can edit student/school
- [ ] Can delete student/school

### 2. Data Persistence
- [ ] Create a test student record
- [ ] Refresh page - record still exists
- [ ] Test data persists in Supabase

### 3. Performance
- [ ] Page load time acceptable (< 3s)
- [ ] No major JavaScript errors (F12)
- [ ] Images/assets load properly
- [ ] UI is responsive on mobile

### 4. Monitoring
- [ ] Check Coolify dashboard:
  - CPU usage reasonable (< 50%)
  - Memory usage reasonable (< 256MB)
  - Uptime > 99%
  - Health checks passing

---

## Security Post-Deployment

### 1. Environment Variables
- [ ] Sensitive keys NOT hardcoded
- [ ] Keys stored in Coolify secrets
- [ ] .env.local NOT in repository
- [ ] .env.example provides template only

### 2. Database Security
- [ ] RLS policies properly configured
- [ ] Consider updating policies from `public` to `authenticated`
- [ ] Regular backups enabled
- [ ] Supabase project password changed

### 3. HTTPS/SSL
- [ ] HTTPS enabled (Coolify handles automatically)
- [ ] SSL certificate valid
- [ ] All traffic redirects to HTTPS

### 4. Access Control
- [ ] Application accessible only to authorized users
- [ ] Admin credentials secure
- [ ] Database credentials not exposed

---

## Troubleshooting During Deployment

### Build Fails
**Check:**
- [ ] All environment variables set correctly
- [ ] Node version compatible (18+)
- [ ] No syntax errors in code
- [ ] Dependencies installed successfully

**Solution:**
- Review build log in Coolify
- Run local Docker build to replicate error
- Check package.json for broken dependencies

### Application Starts But Won't Load
**Check:**
- [ ] Supabase URL/Key correct
- [ ] RLS policies allow access
- [ ] Network connectivity to Supabase
- [ ] Browser console for errors (F12)

**Solution:**
- Verify environment variables in Coolify
- Test Supabase connection with curl
- Check Supabase network logs

### Health Check Failing
**Check:**
- [ ] Port 3000 exposed correctly
- [ ] Application fully started (10+ seconds)
- [ ] No process crashes in logs
- [ ] Firewall allows port 3000

**Solution:**
- Check application logs in Coolify
- Increase health check start period
- Verify port binding in Dockerfile

---

## Maintenance Checklist

### Weekly
- [ ] Check application logs for errors
- [ ] Monitor CPU/Memory usage
- [ ] Verify health checks passing

### Monthly
- [ ] Review security settings
- [ ] Check for available updates
- [ ] Backup Supabase database
- [ ] Test disaster recovery

### Quarterly
- [ ] Security audit
- [ ] Performance optimization
- [ ] Update dependencies
- [ ] Review and update RLS policies

---

## Rollback Plan

If deployment fails:
1. Go to Coolify → Application → Deployments
2. Select previous successful deployment
3. Click **Rollback**
4. Application returns to previous version
5. Investigate new code for issues

---

## Support Resources

- **Coolify Documentation**: https://coolify.io/docs
- **Next.js Documentation**: https://nextjs.org/docs
- **Supabase Documentation**: https://supabase.com/docs
- **Deployment Guide**: See `COOLIFY_DEPLOYMENT_GUIDE.md`

---

## Sign-Off

**Deployment Date**: ________________

**Deployed By**: ________________

**Verified By**: ________________

**Notes**: ________________________________________________

---

**Status**: ⬜ Not Started | 🟡 In Progress | 🟢 Complete | 🔴 Failed

---

Last Updated: 2025-11-10
