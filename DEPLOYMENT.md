# Deployment Guide: Real-Time Interview Assistant

This guide covers step-by-step deployment for both backend (Docker) and frontend (Vercel/Netlify/static host).

---

## 1. Prerequisites
- Node.js 18+ and npm (for local builds)
- Docker & Docker Compose (for backend)
- OpenAI API key (and Deepgram if used)
- (Optional) Vercel/Netlify account for frontend

---

## 2. Backend Deployment (Docker Compose)

### a. Configure Environment
- Edit `backend/.env` and set real API keys:
  ```
  OPENAI_API_KEY=sk-...
  JWT_SECRET=your-strong-secret
  WHISPER_URL=http://whisper:9000/asr
  PORT=5000
  ```

### b. Build & Start Services
- From project root, run:
  ```
  docker-compose up --build
  ```
- This starts both the backend and Whisper STT service.

### c. Verify Backend
- Visit `http://localhost:5000/api/health` to check status.
- WebSocket endpoints:
  - `ws://localhost:5000/ws/audio`
  - `ws://localhost:5000/ws/llm`

---

## 3. Frontend Deployment (Vercel/Netlify/Static Host)

### a. Build Frontend
- In `frontend/`:
  ```
  npm install
  npm run build
  ```
- Output is in `frontend/build/`

### b. Deploy
- **Vercel:**
  - Import project, set build command: `npm run build`, output: `build`
  - Set environment variables in Vercel dashboard:
    - `REACT_APP_BACKEND_URL=https://your-backend-domain`
    - `REACT_APP_WS_AUDIO_URL=wss://your-backend-domain/ws/audio`
    - `REACT_APP_WS_LLM_URL=wss://your-backend-domain/ws/llm`
- **Netlify:**
  - Drag and drop `build/` folder or connect repo
  - Set environment variables in Netlify dashboard
- **Other static hosts:**
  - Upload contents of `build/` to your host

---

## 4. Custom Domain & HTTPS
- Point your domain to your host (Vercel/Netlify provide free HTTPS)
- For backend, use a reverse proxy (e.g., Nginx) for HTTPS if self-hosted

---

## 5. Testing
- Open your deployed frontend URL
- Start screen share, check chat, and verify LLM/STT features

---

## 6. Troubleshooting
- Check backend logs: `docker-compose logs backend`
- Check frontend build output and browser console
- Ensure all environment variables are set correctly

---

## 7. Updating
- Pull latest code, rebuild Docker containers, and redeploy frontend as above

---

For platform-specific help (AWS, DigitalOcean, etc.), see their docs or ask for a tailored guide!
