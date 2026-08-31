# NGO Connect — Production Deployment Guide

This guide covers how to deploy **NGO Connect** to the cloud so anyone can access it via a live public URL.

---

## 🌐 Option 1: Render.com (Recommended — 100% Free & Simplest)

Render can build both the React frontend and Node.js backend as a single service using the included `render.yaml` configuration.

### Steps:
1. **Push your code to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit for NGO Connect"
   git remote add origin https://github.com/YOUR_USERNAME/ngo-connect.git
   git push -u origin main
   ```

2. **Deploy on Render**:
   - Go to [dashboard.render.com](https://dashboard.render.com/) and sign in.
   - Click **"New +"** $\rightarrow$ **"Web Service"**.
   - Connect your GitHub repository.
   - Fill in the settings:
     - **Name**: `ngo-connect`
     - **Environment**: `Node`
     - **Build Command**: `npm run install:all && npm run build`
     - **Start Command**: `npm start`
     - **Plan**: `Free`
   - Click **"Create Web Service"**.

3. **Done!** Render will build the Vite React app and start the Express server. Your app will be live at:
   `https://ngo-connect-xxxx.onrender.com`

---

## 🚂 Option 2: Railway.app

1. Go to [railway.app](https://railway.app/) and click **"Start a New Project"**.
2. Select **"Deploy from GitHub repo"** and choose your `ngo-connect` repo.
3. Railway automatically detects `package.json` or the `Dockerfile` and deploys both backend and frontend.
4. Under your service's **Settings** $\rightarrow$ **Networking**, click **"Generate Domain"** to get your public HTTPS URL.

---

## ⚡ Option 3: Vercel

1. Install the Vercel CLI or import via [vercel.com](https://vercel.com/):
   ```bash
   npm i -g vercel
   vercel
   ```
2. The included `vercel.json` will route `/api/*` to the Express backend and all other routes to the static React frontend build.

---

## 🐳 Option 4: Docker Container Deployment

You can containerize and run NGO Connect anywhere (AWS, GCP, DigitalOcean, local Docker):

1. **Build the Docker image**:
   ```bash
   docker build -t ngo-connect .
   ```

2. **Run the container**:
   ```bash
   docker run -p 5000:5000 ngo-connect
   ```

3. Open `http://localhost:5000` in your browser.

---

## 🖥️ Option 5: Ubuntu VPS / AWS EC2 / DigitalOcean Droplet (with PM2 & Nginx)

1. **Clone and install on the server**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/ngo-connect.git
   cd ngo-connect
   npm run install:all
   npm run build
   ```

2. **Run with PM2 process manager**:
   ```bash
   npm install -g pm2
   pm2 start server/server.js --name "ngo-connect"
   pm2 startup
   pm2 save
   ```

3. **Nginx Reverse Proxy Config (`/etc/nginx/sites-available/default`)**:
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;

       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```
   ```bash
   sudo systemctl restart nginx
   ```
