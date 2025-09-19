import React from 'react';
import React, { useState, useRef } from 'react';
import { isSpeech } from './vad';
// ...existing code...
import './index.css';

const WS_AUDIO_URL = process.env.REACT_APP_WS_AUDIO_URL || 'ws://localhost:5000/ws/audio';
const WS_LLM_URL = process.env.REACT_APP_WS_LLM_URL || 'ws://localhost:5000/ws/llm';

function App() {
  const [chat, setChat] = useState([
    { type: 'system', text: 'Welcome! Start screen share to begin.' }
  ]);
  const [sharing, setSharing] = useState(false);
  const [input, setInput] = useState('');
  const wsAudio = useRef(null);
  const wsLLM = useRef(null);

  // Start/Stop screen share (stub)
  const handleShare = async () => {
    if (!sharing) {
      setSharing(true);
      setChat(c => [...c, { type: 'system', text: 'Screen/audio sharing started' }]);
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
        if (!stream.getAudioTracks().length) {
          setChat(c => [...c, { type: 'system', text: "No audio detected. Make sure you selected the correct tab and checked 'Share audio'." }]);
          setSharing(false);
          return;
        }
        const audioCtx = new window.AudioContext({ sampleRate: 48000 });
        await audioCtx.audioWorklet.addModule('./audioWorklet.js');
        const source = audioCtx.createMediaStreamSource(stream);
        const worklet = new window.AudioWorkletNode(audioCtx, 'pcm16-worklet');
        source.connect(worklet);
        worklet.connect(audioCtx.destination);
        wsAudio.current = new window.WebSocket(WS_AUDIO_URL);
        wsAudio.current.onopen = () => setChat(c => [...c, { type: 'system', text: 'Audio socket connected' }]);
        wsAudio.current.onmessage = e => setChat(c => [...c, { type: 'stt', text: JSON.parse(e.data).text }]);
        worklet.port.onmessage = (e) => {
          const pcm16 = new Int16Array(e.data);
          if (isSpeech(pcm16)) {
            if (wsAudio.current && wsAudio.current.readyState === 1) {
              wsAudio.current.send(e.data);
            }
          }
        };
      } catch (err) {
        setChat(c => [...c, { type: 'system', text: 'Audio capture failed: ' + err.message }]);
        setSharing(false);
      }
    } else {
      setSharing(false);
      setChat(c => [...c, { type: 'system', text: 'Screen/audio sharing stopped' }]);
      if (wsAudio.current) wsAudio.current.close();
    }
  };

  // Manual prompt send (stub)
  const handleSend = () => {
    if (!input.trim()) return;
    setChat(c => [...c, { type: 'user', text: input }]);
    if (!wsLLM.current || wsLLM.current.readyState !== 1) {
      wsLLM.current = new window.WebSocket(WS_LLM_URL);
      wsLLM.current.onmessage = e => {
        const msg = JSON.parse(e.data);
        if (msg.type === 'answer_part' || msg.type === 'answer_final' || msg.type === 'system') {
          setChat(c => [...c, { type: msg.type, text: msg.text }]);
        }
      };
      wsLLM.current.onopen = () => wsLLM.current.send(input);
    } else {
      wsLLM.current.send(input);
    }
    setInput('');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4">
      <div className="w-full max-w-xl bg-white rounded shadow p-4 flex flex-col h-[80vh]">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-xl font-bold">Interview Assistant</h1>
          <button
            className={`px-4 py-2 rounded text-white ${sharing ? 'bg-red-500' : 'bg-blue-600'}`}
            onClick={handleShare}
          >
            {sharing ? 'Stop Sharing' : 'Start Screen Share'}
          </button>
        </div>
        <div className="flex-1 overflow-y-auto space-y-2 mb-2">
          {chat.map((msg, i) => (
            <div key={i} className={
              msg.type === 'user' ? 'text-right' :
              msg.type === 'answer_part' || msg.type === 'answer_final' ? 'text-green-700' :
              msg.type === 'stt' ? 'text-blue-700' : 'text-gray-500'
            }>
              <span className="block px-2 py-1 rounded bg-gray-200 inline-block max-w-[80%]">
                {msg.text}
              </span>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            className="flex-1 border rounded px-2 py-1"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Type a question..."
            onKeyDown={e => e.key === 'Enter' && handleSend()}
          />
          <button className="bg-blue-600 text-white px-4 py-1 rounded" onClick={handleSend}>
            Send
          </button>
        </div>
      </div>
      {sharing && (
        <div className="mt-2 flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-600 animate-pulse"></span>
          <span className="text-red-600 font-semibold">You are sharing audio</span>
          <button
            className="ml-4 px-2 py-1 bg-red-500 text-white rounded"
            onClick={() => sharing && handleShare()}
          >
            Stop
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
