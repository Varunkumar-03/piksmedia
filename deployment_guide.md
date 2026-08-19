# Piks Media Production Deployment Guide

This guide details the steps to deploy the **Piks Media** monorepo application to production.

---

## 1. Architecture Overview
For the best performance, security, and persistence of uploaded images, the recommended architecture is:
* **Frontend (Next.js)**: Deployed to **Vercel** (Free, fast serverless edge rendering).
* **Backend (Node.js/Express)**: Deployed to **Hostinger VPS** (Persistent state for local file uploads, PM2 process management, and Nginx reverse proxy).
* **Database**: **MongoDB Atlas** (Free/Shared cloud tier).

---

## 2. Step 1: Database Setup (MongoDB Atlas)
1. Sign up/Log in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a new Shared Cluster (M0 - Free Tier).
3. Under **Network Access**, add `0.0.0.0/0` (Allow access from anywhere) or whitelist your Hostinger VPS IP address.
4. Under **Database Access**, create a user with read/write privileges and secure credentials.
5. Copy your connection string (e.g. `mongodb+srv://<username>:<password>@cluster0.mongodb.net/piks?retryWrites=true&w=majority`).

---

## 3. Step 2: Frontend Deployment (Vercel)
Vercel is the native platform for Next.js and hosts frontends for free.

### Prepare Git Repository
Push your project workspace `piks` to a private GitHub, GitLab, or Bitbucket repository.

### Setup Vercel Project
1. Log in to [Vercel](https://vercel.com) and click **Add New** -> **Project**.
2. Import your Git repository.
3. In the project settings configuration:
   * **Root Directory**: Select `apps/web`.
   * **Framework Preset**: Next.js.
   * **Build and Output Settings**: Keep default settings.
4. Add **Environment Variables**:
   * `NEXT_PUBLIC_API_URL`: `https://api.yourdomain.com/api/v1` (Replace with your backend domain URL).
5. Click **Deploy**. Vercel will build and assign you a secure HTTPS URL.

---

## 4. Step 3: Backend Deployment (Hostinger VPS)
Since the backend uses local disk storage via Multer to save custom uploaded product images, it requires a persistent file system (VPS) instead of serverless (Vercel).

### Server Setup (Ubuntu Linux)
SSH into your VPS server using your credentials:
```bash
ssh root@your_vps_ip
```

### Install Dependencies
Run the commands below to set up Node.js, Git, Nginx, and PM2:
```bash
# Update packages
sudo apt update && sudo apt upgrade -y

# Install Node.js (Version 20)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Nginx
sudo apt install nginx -y

# Install PM2 (Process Manager) globally
sudo npm install pm2 -g
```

### Clone Project and Install Modules
Clone your repository to the VPS:
```bash
cd /var/www
git clone https://github.com/yourusername/piks.git
cd piks/apps/api

# Install backend dependencies
npm install
```

### Setup Environment Configuration
Create a `.env` file in `apps/api`:
```bash
nano .env
```
Add your production configuration:
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/piks?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_production_key
NODE_ENV=production
```
Press `Ctrl+O` then `Enter` to save, and `Ctrl+X` to exit.

### Start the Server with PM2
To ensure the backend server runs continuously and restarts automatically upon server crash or reboot:
```bash
# Start backend server
pm2 start src/index.ts --name piks-api

# Configure PM2 to start on system boot
pm2 startup
pm2 save
```

---

## 5. Step 4: Configure Reverse Proxy (Nginx)
Nginx will route incoming HTTPS requests from `https://api.yourdomain.com` to the Node process running locally on port `5000`.

### Configure Nginx Server Block
Create a configuration file:
```bash
sudo nano /etc/nginx/sites-available/piks-api
```
Paste the configuration:
```nginx
server {
    listen 80;
    server_name api.yourdomain.com; # Replace with your domain

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Serve static uploaded files directly through Nginx for speed
    location /uploads/ {
        alias /var/www/piks/apps/api/uploads/;
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }
}
```
Enable the site block and restart Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/piks-api /etc/nginx/sites-enabled/
sudo nginx -t # Test syntax
sudo systemctl restart nginx
```

---

## 6. Step 5: Install SSL (Certbot)
Secure your API domain using free Let's Encrypt SSL certificates:
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d api.yourdomain.com
```
Follow the interactive prompts to enable automatic HTTPS redirection.

Your application is now securely deployed and ready for production!
