// AudioWorkletProcessor for PCM16 16kHz mono conversion
class PCM16WorkletProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.buffer = [];
    this.targetSampleRate = 16000;
    this.inputSampleRate = sampleRate;
  }

  process(inputs) {
    const input = inputs[0][0];
    if (!input) return true;
    // Downsample to 16kHz mono
    const downsampled = this.downsample(input, this.inputSampleRate, this.targetSampleRate);
    // Convert to PCM16
    const pcm16 = new Int16Array(downsampled.length);
    for (let i = 0; i < downsampled.length; i++) {
      pcm16[i] = Math.max(-1, Math.min(1, downsampled[i])) * 0x7fff;
    }
    this.port.postMessage(pcm16.buffer, [pcm16.buffer]);
    return true;
  }

  downsample(buffer, inputRate, outputRate) {
    if (outputRate === inputRate) return buffer;
    const ratio = inputRate / outputRate;
    const outLength = Math.floor(buffer.length / ratio);
    const result = new Float32Array(outLength);
    let pos = 0;
    for (let i = 0; i < outLength; i++) {
      result[i] = buffer[Math.floor(pos)];
      pos += ratio;
    }
    return result;
  }
}

registerProcessor('pcm16-worklet', PCM16WorkletProcessor);
