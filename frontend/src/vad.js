// Simple energy-based Voice Activity Detection (VAD)
export function isSpeech(frame) {
  // frame: Int16Array
  let sum = 0;
  for (let i = 0; i < frame.length; i++) {
    sum += Math.abs(frame[i]);
  }
  const avg = sum / frame.length;
  // Threshold may need tuning
  return avg > 500;
}
