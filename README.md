# Real-Time Interview Assistant

This project is a web application that acts as a real-time interview assistant, similar to lockedin.ai/finalround.ai.

## Features
- Screen + tab audio capture (with audio sharing)
- Real-time speech-to-text (STT) using Whisper/Deepgram/Google
- Interview question detection and LLM-powered answer suggestions
- Chat-style UI with transcriptions and AI answers
- Manual prompt input and response
- Voice Activity Detection (VAD) to avoid sending silence
- Privacy and error handling features

## Tech Stack
- **Frontend:** React, Tailwind CSS, WebAudio, WebSockets
- **Backend:** Node.js (Express), ws, STT (Whisper/Deepgram/Google), LLM (OpenAI)
- **Deployment:** Docker Compose, Vercel/Netlify (frontend)

## Getting Started

### Prerequisites
- Node.js 18+
- npm
- Docker (for Whisper STT worker)

### Setup

#### 1. Clone the repository
```
git clone <repo-url>
cd <repo-root>
```

#### 2. Install dependencies
```
cd backend
npm install
cd ../frontend
npm install
```

#### 3. Configure Environment
- Copy `.env.example` to `.env` in both `backend/` and `frontend/` as needed.
- Set your API keys and config values.

#### 4. Run Locally
- **Backend:**
  ```
  cd backend
  npm start
  ```
- **Frontend:**
  ```
  cd frontend
  npm start
  ```

#### 5. Docker Compose (for backend + Whisper STT)
```
docker-compose up --build
```

## Deployment
- Frontend: Deploy to Vercel/Netlify
- Backend: Deploy Docker container to your server

## License
MIT
