# Vercel Environment Variables Setup

## Problem
After login and refresh on the Vercel deployed app:
- Shows `404: NOT_FOUND` error from Supabase
- Works fine on localhost (http://localhost:5173)
- Environment variables not being passed to the frontend build

## Root Cause
Vite environment variables need:
1. **Correct prefix**: `VITE_` (for client-side access)
2. **Proper deployment**: Set in Vercel before build
3. **Rebuild after setting**: Vercel needs to rebuild with new variables

## Step 1: Check Current Vercel Settings

1. Go to **Vercel Dashboard** → Your Project
2. Click **Settings** → **Environment Variables**
3. Look for variables:
   - `VITE_SUPABASE_URL` ← Should exist
   - `VITE_SUPABASE_ANON_KEY` ← Should exist
   - `VITE_API_URL` ← Optional, defaults to http://localhost:3000

If any are missing or wrong, continue to Step 2.

## Step 2: Add/Update Environment Variables in Vercel

### For all environments (Production, Preview, Development):

1. **Go to Settings → Environment Variables**
2. **Remove old variables** if they exist without `VITE_` prefix:
   - Delete `SUPABASE_URL`
   - Delete `SUPABASE_ANON_KEY`
   
3. **Add these variables** with `VITE_` prefix:

**Variable 1:**
```
Name: VITE_SUPABASE_URL
Value: https://ibkdahjnuflivryzpwoi.supabase.co
(or your actual Supabase URL)
```

**Variable 2:**
```
Name: VITE_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
(or your actual Supabase anon key)
```

**Variable 3 (Optional - if using backend API):**
```
Name: VITE_API_URL
Value: https://secure-vault-api.onrender.com
(or your backend API URL)
```

4. **Apply to:** Select all three (Production, Preview, Development)

## Step 3: Redeploy on Vercel

After adding environment variables, Vercel will automatically detect the change.

1. Option A: **Automatic** (recommended)
   - Go to **Deployments**
   - The latest deployment should be re-building
   - Wait for build to complete

2. Option B: **Manual redeploy**
   - Go to **Deployments**
   - Click the three dots on latest deployment
   - Click **Redeploy** → **Redeploy**
   - Wait for new build to complete

## Step 4: Test the Fix

After redeploy completes:

1. **Visit your Vercel app**: https://datamanagement360.vercel.app
2. **Login with your PIN**
3. **Navigate to any page** (e.g., Credit Cards)
4. **Refresh the page** (F5 or Cmd+R)
5. **Should stay on same page** (not redirect to login)
6. **Try other pages** - refresh and verify all work

## Verify Environment Variables Are Set

Open **Browser DevTools** (F12) and paste in Console:
```javascript
console.log({
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
  supabaseKey: import.meta.env.VITE_SUPABASE_ANON_KEY?.substring(0, 20) + '...',
  apiUrl: import.meta.env.VITE_API_URL
})
```

Should show:
```
{
  supabaseUrl: "https://ibkdahjnuflivryzpwoi.supabase.co",
  supabaseKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
  apiUrl: "https://secure-vault-api.onrender.com"
}
```

If you see `undefined` for any value, the variables aren't set in Vercel.

## Common Issues

### Issue 1: Still getting 404 after redeploy
**Solution:**
1. Check environment variables are set (use console.log above)
2. Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
3. Clear browser cache: DevTools → Application → Clear Storage → Clear Site Data
4. If still fails, redeploy again

### Issue 2: Build fails on Vercel
**Solution:**
1. Go to **Deployments** → Failed build → View logs
2. Look for errors about missing variables
3. Ensure `VITE_` prefix is used (not `REACT_APP_` or plain names)

### Issue 3: Only works on localhost
**Solution:**
1. localhost uses local `.env` file
2. Vercel uses environment variables in dashboard
3. Make sure Vercel variables match your `.env` file

## How to Get Your Supabase Credentials

If you don't have these values:

1. **Go to Supabase Dashboard**: https://app.supabase.com
2. **Select your project**
3. **Click Settings** (bottom left)
4. **Go to API tab**

You'll see:
- **Project URL** → Use this for `VITE_SUPABASE_URL`
- **anon public key** → Use this for `VITE_SUPABASE_ANON_KEY`
- **service_role key** → Only for backend (not frontend)

## Expected Behavior After Fix

| Action | Before Fix | After Fix |
|--------|-----------|-----------|
| Login on Vercel | ✓ Works | ✓ Works |
| Refresh on Vercel | ❌ 404 Error | ✓ Stays logged in |
| Logout on Vercel | ✓ Works | ✓ Works |
| Session timeout | ✓ Works | ✓ Works |

## Additional Notes

- **Local development** uses `.env` file (has `VITE_` prefix)
- **Deployed on Vercel** uses dashboard environment variables (must have `VITE_` prefix)
- Environment variables are built into the app at build time, not loaded at runtime
- That's why redeploy is needed after changing variables

## Need Help?

If still having issues:
1. Check browser console for actual errors (not just 404)
2. Check Vercel build logs
3. Make sure you're using the anon key, not service role key
4. Verify Supabase project is still active and not deleted

## Git Workflow

**Important:** Never commit `.env` files to Git!

✅ Good:
```bash
git add .gitignore
git add src/
git commit -m "Deploy to Vercel"
git push
```

❌ Bad (don't do this):
```bash
git add .env          # DON'T commit .env
git commit -m "Add secrets"
git push              # Secrets are now public!
```

.env should be in .gitignore (it probably already is).
