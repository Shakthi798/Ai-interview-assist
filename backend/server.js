require('dotenv').config();
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const winston = require('winston');
const { sttWhisper } = require('./sttWhisper');
const { streamLLM } = require('./streamLLM');

const app = express();
app.use(cors());
app.use(express.json());

// Logger setup
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.simple(),
  transports: [new winston.transports.Console()]
});

const server = http.createServer(app);
const wssAudio = new WebSocket.Server({ noServer: true });
const wssLLM = new WebSocket.Server({ noServer: true });

// --- WebSocket: /ws/audio ---
// JWT Auth middleware for WebSocket
function verifyJWT(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
}

server.on('upgrade', (req, socket, head) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const token = url.searchParams.get('token');
  if (!token || !verifyJWT(token)) {
    socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
    socket.destroy();
    return;
  }
  if (url.pathname === '/ws/audio') {
    wssAudio.handleUpgrade(req, socket, head, ws => {
      wssAudio.emit('connection', ws, req);
    });
  } else if (url.pathname === '/ws/llm') {
    wssLLM.handleUpgrade(req, socket, head, ws => {
      wssLLM.emit('connection', ws, req);
    });
  } else {
    socket.destroy();
  }
});


wssAudio.on('connection', ws => {
  let audioChunks = [];
  let sttTimeout = null;
  ws.on('message', msg => {
    // Sanitize: ensure msg is Buffer
    if (!(msg instanceof Buffer)) return;
    audioChunks.push(Buffer.from(msg));
    if (!sttTimeout) {
      sttTimeout = setTimeout(async () => {
        const audioBuffer = Buffer.concat(audioChunks);
        audioChunks = [];
        try {
          const data = await sttWhisper(audioBuffer);
          if (data && data.text) {
            ws.send(JSON.stringify({ type: 'stt', text: data.text }));
            // Simple question detection: ends with ? or starts with wh-word
            const questionRegex = /^(who|what|when|where|why|how|is|are|do|does|can|could|would|should|did|will|have|has|had)\b|\?$/i;
            if (questionRegex.test(data.text.trim())) {
              ws.send(JSON.stringify({ type: 'system', text: 'Detected question: ' + data.text }));
              // Optionally, forward to LLM
            }
          }
        } catch (err) {
          logger.error('STT error: ' + err.message);
          ws.send(JSON.stringify({ type: 'system', text: 'STT error: ' + err.message }));
        }
        sttTimeout = null;
      }, 1000);
    }
  });
  ws.on('close', () => {
    if (sttTimeout) clearTimeout(sttTimeout);
  });
});


wssLLM.on('connection', ws => {
  ws.on('message', async msg => {
    // Sanitize: limit prompt length
    const prompt = msg.toString().slice(0, 1000);
    try {
      await streamLLM(prompt, ws);
    } catch (err) {
      logger.error('LLM error: ' + err.message);
      ws.send(JSON.stringify({ type: 'system', text: 'LLM error: ' + err.message }));
    }
  });
});

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));


const PORT = process.env.PORT || 5000;
server.listen(PORT, () => logger.info(`Server running on port ${PORT}`));
