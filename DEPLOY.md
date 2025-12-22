# Deployment Guide for Vercel

This application is designed to be easily deployed on Vercel. It uses Vercel Serverless Functions for the backend (`api/` folder) and Vite for the frontend.

## Prerequisites

1.  **GitHub Account**: You need to push this code to a GitHub repository.
2.  **Vercel Account**: Sign up at [vercel.com](https://vercel.com).
3.  **Neon DB Connection String**: You already have this.

## Steps to Deploy

### 1. Push Code to GitHub
Initialize a git repository and push your code:
```bash
git init
git add .
git commit -m "Initial commit"
# Create a new repo on GitHub and follow instructions to push, e.g.:
# git remote add origin <your-repo-url>
# git push -u origin main
```

### 2. Import Project in Vercel
1.  Go to your [Vercel Dashboard](https://vercel.com/dashboard).
2.  Click **"Add New..."** -> **"Project"**.
3.  Select your GitHub repository and click **"Import"**.

### 3. Configure Project Settings
Vercel should automatically detect that this is a **Vite** project.
- **Framework Preset**: Vite
- **Root Directory**: `./` (default)
- **Build Command**: `npm run build` (default)
- **Output Directory**: `dist` (default)

### 4. Set Environment Variables
In the "Environment Variables" section of the deployment screen:
1.  Add a new variable:
    - **Name**: `DATABASE_URL`
    - **Value**: `postgresql://neondb_owner:npg_OF2qiwlJ9DpQ@ep-flat-wind-ahvtupex-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require`
    *(Note: It's best practice to use the connection string from your Neon dashboard, but the one in your code will work if copied here.)*

### 5. Deploy
Click **"Deploy"**.
Vercel will:
1.  Install dependencies.
2.  Build the frontend.
3.  Deploy the Serverless Functions in `api/`.

### 6. Verify
Once deployed, open the provided URL.
- The frontend should load.
- The API calls to `/api/progress` should work (you can check the Network tab in DevTools).

## Troubleshooting
- **API 404**: If API calls fail, ensure the `api/` folder is at the root of your project.
- **Database Error**: Check the Function Logs in Vercel Dashboard for any connection errors. Ensure `DATABASE_URL` is set correctly.
