# Deployment Guide: Vercel (Frontend) + Render (Backend)

## Prerequisites

- GitHub account with your repository
- Vercel account (free)
- Render account (free)
- Supabase project set up

## Part 1: Deploy Backend to Render

### Step 1: Push Code to GitHub

```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### Step 2: Create Render Service

1. Go to [Render.com](https://render.com)
2. Sign up/Login with GitHub
3. Click **New +** → **Web Service**
4. Connect your GitHub repository
5. Configure the service:
   - **Name**: `secure-vault-api`
   - **Root Directory**: `src/server`
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free (or paid if needed)

### Step 3: Add Environment Variables

In Render dashboard, go to **Environment**:

```
PORT=3000
NODE_ENV=production
SUPABASE_URL=https://ibkdahjnuflivryzpwoi.supabase.co
SUPABASE_SERVICE_KEY=<copy from src/server/.env>
JWT_SECRET=<copy from src/server/.env>
ENCRYPTION_KEY=<copy from src/server/.env>
CORS_ORIGIN=https://your-vercel-app.vercel.app
```

Replace `https://your-vercel-app.vercel.app` with your actual Vercel frontend URL (you'll get this in Part 2).

**Important**: Store sensitive values in Render's environment variable section, not in code.

### Step 4: Deploy

Click **Deploy** and wait for build to complete. The deployment logs will show your backend URL:
```
https://secure-vault-api.onrender.com
```

**Note**: Free tier services sleep after 15 minutes of inactivity. First request takes ~30 seconds.

---

## Part 2: Deploy Frontend to Vercel

### Step 1: Update Environment Configuration

Update `.env.production` in your frontend root:

```env
VITE_SUPABASE_URL=https://ibkdahjnuflivryzpwoi.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
VITE_API_URL=https://secure-vault-api.onrender.com
```

Or update the `.env` file before pushing:

```bash
# Update the frontend .env
echo "VITE_API_URL=https://secure-vault-api.onrender.com" >> .env
```

### Step 2: Create Vercel Project

1. Go to [Vercel.com](https://vercel.com)
2. Sign up/Login with GitHub
3. Click **Add New** → **Project**
4. Import your repository
5. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (root)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### Step 3: Add Environment Variables (Optional)

If using `.env.example`, you can set these in Vercel dashboard:

```
VITE_SUPABASE_URL=https://ibkdahjnuflivryzpwoi.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
VITE_API_URL=https://secure-vault-api.onrender.com
```

### Step 4: Deploy

Click **Deploy** and wait for completion. You'll get a URL like:
```
https://your-app.vercel.app
```

---

## Part 3: Update Backend CORS

After getting your Vercel URL:

1. Go to Render dashboard
2. Select your backend service
3. Go to **Settings** → **Environment**
4. Update `CORS_ORIGIN`:
   ```
   https://your-app.vercel.app
   ```
5. Click **Save** (this triggers a redeploy)

---

## Testing Deployment

### Test Backend Health Check

```bash
curl https://secure-vault-api.onrender.com/health
```

Expected response:
```json
{"success": true, "message": "Server is running"}
```

### Test Frontend

1. Visit `https://your-app.vercel.app`
2. Try logging in (this calls the backend API)
3. Create a test bank account
4. Check browser DevTools Network tab to verify API calls go to your Render backend

---

## Troubleshooting

### Frontend API Calls Failing (CORS Error)

**Problem**: `Access to XMLHttpRequest blocked by CORS policy`

**Solution**:
1. Check `CORS_ORIGIN` environment variable in Render matches your Vercel URL
2. Verify it includes `https://` (not http://)
3. Redeploy backend after updating CORS_ORIGIN

### Backend Variables Not Loading

**Problem**: `Cannot read property of undefined` errors

**Solution**:
1. Verify all environment variables are set in Render dashboard
2. Check variable names match exactly (case-sensitive)
3. Redeploy: Dashboard → Service → **Manual Deploy** → **Deploy Latest Commit**

### Build Failures

**Frontend**:
```bash
npm run build  # Test locally first
```

**Backend**:
```bash
cd src/server
npm install
npm run build
```

### Free Tier Cold Starts

Render free tier sleeps services after 15 minutes. First request takes ~30 seconds. Use paid tier for always-on service.

---

## Environment Variables Summary

### Frontend (.env)
```
VITE_SUPABASE_URL=<your-supabase-url>
VITE_SUPABASE_ANON_KEY=<your-anon-key>
VITE_API_URL=https://secure-vault-api.onrender.com
```

### Backend (Render Dashboard)
```
PORT=3000
NODE_ENV=production
SUPABASE_URL=<your-supabase-url>
SUPABASE_SERVICE_KEY=<your-service-key>
JWT_SECRET=<your-jwt-secret>
ENCRYPTION_KEY=<your-encryption-key>
CORS_ORIGIN=https://your-app.vercel.app
```

---

## Redeploying Updates

### Frontend (Vercel)
```bash
git add .
git commit -m "Update frontend"
git push origin main
# Vercel auto-deploys on git push
```

### Backend (Render)
```bash
git add .
git commit -m "Update backend"
git push origin main
# Manual: Render dashboard → Service → Manual Deploy
# Or: Push to main and configure auto-deploy in Render settings
```

---

## Security Notes

1. **Never commit `.env` files to GitHub** - they contain secrets
2. Use `.env.example` as template with placeholder values
3. Store actual secrets only in deployment platform environment variables
4. Rotate JWT_SECRET and ENCRYPTION_KEY periodically in production
5. Use Supabase's Row Level Security (RLS) policies for database security
