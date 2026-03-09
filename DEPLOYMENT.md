# Deployment Guide

## Frontend - Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. Select the **frontend** folder as root directory
5. Add Environment Variables:
   - `VITE_BACKEND_URL` = `https://ohoofashion-backend.up.railway.app` (update with your Railway domain)
6. Click **Deploy**

## Backend - Railway (Recommended)

### Setup Railway Account:
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub (easiest)
3. Click **"New Project"**
4. Select **"Deploy from GitHub repo"**
5. Connect your GitHub repository

### Deploy Backend:
1. Select the **Ohoofashion** repository
2. In the Railway dashboard, click **"New Service"** → **"GitHub Repo**
3. Configure the service:
   - **Service Name**: `ohoofashion-backend`
   - **Base Directory**: `backend`
   - **Start Command**: `npm run start`

4. Add Environment Variables (in Railway dashboard):
   - `DATABASE_URL` - Your Turso database URL
   - `DATABASE_AUTH_TOKEN` - Your Turso auth token
   - `JWT_SECRET` - Your JWT secret
   - `CLOUDINARY_CLOUD_NAME` - Cloudinary cloud name
   - `CLOUDINARY_API_KEY` - Cloudinary API key
   - `CLOUDINARY_API_SECRET` - Cloudinary API secret
   - `NODE_ENV` = `production`

5. Railway will automatically generate a domain like: `https://ohoofashion-backend.up.railway.app`

6. Once deployed, update `frontend/vercel.json` with your actual Railway domain and redeploy frontend

### Why Railway is Better Than Render:
- ✅ Simpler configuration (auto-detects Node.js)
- ✅ Faster deployments
- ✅ Better free tier performance
- ✅ Native GitHub integration
- ✅ Easy environment variable management

## Alternative: Use Render Again

If you want to continue with Render, clear the build cache and redeploy. The configuration is ready in `render.yaml`.
