// sttWhisper.js
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function sttWhisper(audioBuffer) {
  const resp = await fetch(process.env.WHISPER_URL || 'http://localhost:9000/asr', {
    method: 'POST',
    headers: { 'Content-Type': 'audio/pcm' },
    body: audioBuffer
  });
  return await resp.json();
}

module.exports = { sttWhisper };
