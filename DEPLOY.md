# Deploying SymptomSense to Vercel

## Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/symptom-sense)

## Manual Deployment Steps

### 1. Prerequisites
- A [Vercel account](https://vercel.com/signup) (free)
- Git repository for your project
- Node.js and npm installed locally

### 2. Install Vercel CLI (Optional)
```bash
npm install -g vercel
```

### 3. Deploy via Vercel Dashboard

1. **Push your code to GitHub/GitLab/Bitbucket**
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

2. **Import Project to Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Click "Import Git Repository"
   - Select your `symptom-sense` repository
   - Vercel will auto-detect Angular settings

3. **Configure Build Settings** (Already configured in `vercel.json`)
   - Framework Preset: **Angular**
   - Build Command: `npm run build`
   - Output Directory: `dist/symptom-sense/browser`
   - Install Command: `npm install`

4. **Environment Variables** (if needed)
   - Click "Environment Variables"
   - Add any API keys or secrets:
     ```
     VITE_API_URL=your-api-url
     ```

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Your app will be live at `https://your-project.vercel.app`

### 4. Deploy via CLI

```bash
# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

### 5. Custom Domain (Optional)

1. Go to your project dashboard on Vercel
2. Navigate to "Settings" → "Domains"
3. Add your custom domain
4. Update DNS records as instructed

## Configuration Files

### `vercel.json`
- Configures build settings
- Sets up routing for Angular
- Adds security headers
- Configures caching

### `.vercelignore`
- Excludes unnecessary files from deployment
- Reduces build size and time

## Automatic Deployments

Once connected to Git:
- **Push to `main`** → Production deployment
- **Push to other branches** → Preview deployment
- **Pull requests** → Automatic preview URLs

## Troubleshooting

### Build Fails
1. Check Node.js version (use Node 18+)
2. Clear cache: `vercel --force`
3. Check build logs in Vercel dashboard

### Routing Issues
- Ensure `vercel.json` rewrites are configured correctly
- All routes redirect to `/index.html` for client-side routing

### Environment Variables
- Add them in Vercel dashboard under "Settings" → "Environment Variables"
- Redeploy after adding new variables

## Performance Optimization

Your `vercel.json` includes:
- ✅ Security headers (X-Frame-Options, CSP, etc.)
- ✅ Asset caching (1 year for immutable assets)
- ✅ SPA routing support
- ✅ Automatic HTTPS
- ✅ Global CDN distribution

## Monitoring

- View analytics in Vercel dashboard
- Monitor build times and deployment status
- Set up notifications for failed deployments

---

**🚀 Your app is now Vercel-ready!**

