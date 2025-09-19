# Full Deployment Guide: DigitalOcean (Backend) + Vercel (Frontend)

This guide walks you through deploying your real-time interview assistant with a Dockerized backend (Node.js + Whisper) on DigitalOcean and a static React frontend on Vercel.

---

## 1. Backend: DigitalOcean Droplet

### a. Create Droplet
- Go to https://cloud.digitalocean.com/droplets
- Choose Ubuntu 22.04, 2+ vCPUs, 4GB+ RAM (for Whisper)
- Add SSH key or set root password
- Create and note the public IP

### b. SSH & Install Docker
```sh
ssh root@your_droplet_ip
# Update and install Docker
sudo apt update && sudo apt upgrade -y
sudo apt install -y docker.io docker-compose git
sudo usermod -aG docker $USER
exit
# Reconnect to apply group change
ssh root@your_droplet_ip
```

### c. Clone Your Repo & Configure
```sh
git clone https://github.com/yourusername/yourrepo.git
cd yourrepo
# Edit backend/.env with real API keys
nano backend/.env
```

### d. Start Backend & Whisper
```sh
docker-compose up --build -d
```
- Backend: http://your_droplet_ip:5000
- Whisper: http://your_droplet_ip:9000

### e. (Optional) Set Up Domain & HTTPS
- Point your domain's A record to your Droplet IP
- Install Nginx:
  ```sh
  sudo apt install nginx
  ```
- Configure Nginx as a reverse proxy for backend (port 5000)
- Use Certbot for free SSL:
  ```sh
  sudo apt install certbot python3-certbot-nginx
  sudo certbot --nginx
  ```

---

## 2. Frontend: Vercel

### a. Prepare Frontend
- Push your code to GitHub/GitLab
- In `frontend/`, run:
  ```sh
  npm install
  npm run build
  ```

### b. Deploy to Vercel
- Go to https://vercel.com/import
- Import your repo, select `frontend/` as the project root
- Set build command: `npm run build`, output: `build`
- Set environment variables:
  - `REACT_APP_BACKEND_URL=https://your-domain.com`
  - `REACT_APP_WS_AUDIO_URL=wss://your-domain.com/ws/audio`
  - `REACT_APP_WS_LLM_URL=wss://your-domain.com/ws/llm`
- Deploy!

---

## 3. Test Everything
- Visit your Vercel frontend URL
- Start screen share, check chat, and verify LLM/STT features
- Check backend logs:
  ```sh
  docker-compose logs backend
  ```

---

## 4. Updating
- Pull latest code on Droplet, re-run `docker-compose up --build -d`
- Redeploy frontend on Vercel

---

## 5. Troubleshooting
- Backend not reachable? Check firewall, Docker, and Nginx config
- LLM/STT not working? Check API keys in `.env` and backend logs
- WebSocket issues? Ensure you use `wss://` in production with HTTPS

---

For more help, see DigitalOcean and Vercel docs or ask for a custom step!
