# Deployment Guide - Multiple FREE Options

## 🎯 Top Recommendation: Vercel Functions (FREE Forever!)

**Deploy everything to Vercel** - Frontend + Backend API in one place:

1. **Go to [vercel.com](https://vercel.com)**
2. **Import your GitHub repository**
3. **Root Directory**: `/` (leave as root)
4. **Add Environment Variables**:
   - `DATABASE_URL` - Your Turso database URL
   - `DATABASE_AUTH_TOKEN` - Your Turso auth token
   - `JWT_SECRET` - Your JWT secret
   - `CLOUDINARY_CLOUD_NAME` - Cloudinary cloud name
   - `CLOUDINARY_API_KEY` - Cloudinary API key
   - `CLOUDINARY_API_SECRET` - Cloudinary API secret
5. **Deploy!**

**URLs:**
- Website: `https://ohoofashion.vercel.app`
- API: `https://ohoofashion.vercel.app/api/*`

---

## 🚀 Alternative: Cyclic (FREE & Simple)

Cyclic offers **completely free** hosting with great performance:

### Deploy Backend to Cyclic:

1. **Go to [cyclic.sh](https://cyclic.sh)**
2. **Sign up** with GitHub
3. **Click "New Project"**
4. **Connect your GitHub repository**
5. **Configure deployment**:
   - **Root Directory**: `backend/`
   - **Build Command**: Leave empty (no build needed)
   - **Start Command**: `npm start`

6. **Add Environment Variables**:
   - `DATABASE_URL` - Your Turso database URL
   - `DATABASE_AUTH_TOKEN` - Your Turso auth token
   - `JWT_SECRET` - Your JWT secret
   - `CLOUDINARY_CLOUD_NAME` - Cloudinary cloud name
   - `CLOUDINARY_API_KEY` - Cloudinary API key
   - `CLOUDINARY_API_SECRET` - Cloudinary API secret
   - `NODE_ENV` = `production`

7. **Deploy!** Cyclic will give you a URL like: `https://your-app.cyclic.app`

### Update Frontend:
After Cyclic deploys, update your Vercel frontend:
1. Go to Vercel dashboard
2. Add environment variable: `VITE_BACKEND_URL` = `https://your-cyclic-app.cyclic.app`
3. Redeploy frontend

---

## ⚡ Alternative: Railway (30-day trial)

Railway is excellent but requires payment after trial:

1. **Go to [railway.app](https://railway.app)**
2. **Connect GitHub repo**
3. **Set Base Directory**: `backend/`
4. **Start Command**: `npm start`
5. **Add environment variables** (same as above)
6. **Deploy**

---

## 📊 Comparison

| Platform | Cost | Setup | Performance | Limits |
|----------|------|-------|-------------|---------|
| **Vercel Functions** | FREE forever | 1-click | ⚡ Global CDN | 100GB bandwidth |
| **Cyclic** | FREE forever | Simple | ⚡ Fast | Generous limits |
| **Railway** | $5+/month | Simple | ⚡ Fast | Trial limits |
| **Render** | $7+/month | Complex | Good | Paid required |

**🎯 Best for you: Vercel Functions (already configured)**

If you want to try Cyclic, let me know and I'll help you set it up!
