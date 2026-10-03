# Polynite: Battle Royale

A fast-paced low-poly 3D Battle Royale game built with Three.js, React, and Vite.

## Quick Start (Local)

```bash
# 1. Install dependencies
npm install

# 2. Run local dev server
npm run dev
```

## How to Deploy to GitHub Pages (Automated)

This repository includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that automatically builds and publishes your site whenever you push code.

### Step 1: Enable GitHub Actions for Pages
1. Go to your repository on GitHub.
2. Click **Settings** (top navigation bar).
3. In the left sidebar, click **Pages** (under the "Code and automation" section).
4. Under **Build and deployment > Source**, change the dropdown from *Deploy from a branch* to **GitHub Actions**.

### Step 2: Push your code
Push your code to the `main` or `master` branch:
```bash
git add .
git commit -m "Configure GitHub Pages deployment"
git push origin main
```

### Step 3: View your live game
1. Go to the **Actions** tab in your repository to watch the deployment run (takes ~45 seconds).
2. Once complete, your game will be live at:
   `https://<your-username>.github.io/<your-repo-name>/`

---

## Deploying to Vercel or Netlify (Alternative)

If you prefer Vercel or Netlify:
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`
