# Deployment Guide: Intern Desk on Render

This guide provides step-by-step instructions to deploy the entire Intern Desk full-stack application for **free** on [Render](https://render.com).

## 1. Deploying the Database (PostgreSQL)

Since SQLite is not ideal for free-tier web services (it resets on every deploy), we recommend using Render's Managed PostgreSQL.

1.  Log in to [Render](https://render.com).
2.  Click **New +** and select **PostgreSQL**.
3.  Name it `interndesk-db`.
4.  Select the **Free** tier.
5.  Click **Create Database**.
6.  Once created, copy the **Internal Database URL** (for backend) and **External Database URL** (for local testing).

---

## 2. Deploying the Backend (Web Service)

1.  Click **New +** and select **Web Service**.
2.  Connect your GitHub repository.
3.  Set the following:
    - **Name**: `interndesk-backend`
    - **Root Directory**: `server`
    - **Build Command**: `npm install`
    - **Start Command**: `npm start`
4.  Under **Advanced**, add the following **Environment Variables**:
    - `PORT`: `10000`
    - `DATABASE_URL`: (Paste your **Internal Database URL** from Step 1)
    - `JWT_SECRET`: (Any random string)
    - `NODE_ENV`: `production`
5.  Click **Create Web Service**.

---

## 3. Deploying the Frontend (Static Site)

1.  Click **New +** and select **Static Site**.
2.  Connect your GitHub repository.
3.  Set the following:
    - **Name**: `interndesk-frontend`
    - **Root Directory**: `client`
    - **Build Command**: `npm install && npm run build`
    - **Publish Directory**: `dist`
4.  Under **Advanced**, add the following **Environment Variable**:
    - `VITE_API_BASE_URL`: (The URL of your deployed backend)
5.  Click **Create Static Site**.

---

## 4. Final Configuration

### Environment Variables
Ensure your frontend code uses the environment variable for API calls:
```javascript
// Example in AuthContext.tsx or API helper
const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
```

### Base64 Images (About Us Section)
In `client/src/pages/LandingPage.tsx`, look for the `about-us` section. We have placed placeholders for creator photos. 
**To replace them:**
1.  Convert your images to Base64 (using an online tool).
2.  Find the `img` property for each creator in the array.
3.  Replace the `data:image/png;base64,...` string with your actual Base64 code.

---

## Summary Checklist
- [ ] PostgreSQL Database created on Render.
- [ ] Backend Web Service deployed with `DATABASE_URL`.
- [ ] Frontend Static Site deployed with `VITE_API_BASE_URL`.
- [ ] Base64 placeholders replaced with actual images in `LandingPage.tsx`.
