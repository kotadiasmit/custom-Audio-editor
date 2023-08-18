import React, { useState, useEffect, useRef } from "react";
import toWav from "audiobuffer-to-wav";

const AudioTrim = () => {
  const [audioBuffer, setAudioBuffer] = useState(null);
  const [audioSource, setAudioSource] = useState(null);
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(10);
  const [downloadLink, setDownloadLink] = useState(null);

  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const audioFileRef = useRef();

  useEffect(() => {
    if (audioBuffer) {
      if (audioSource) {
        audioSource.stop(); // Stop any ongoing audio playback
      }

      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      setAudioSource(source);
      source.start();
    }
  }, [audioBuffer]);

  const onUpload = async (e) => {
    const file = e.target.files[0];
    const arrayBuffer = await file.arrayBuffer();
    audioContext.decodeAudioData(arrayBuffer, (buffer) => {
      setAudioBuffer(buffer);
      setStart(0);
      setEnd(buffer.duration);
    });
  };

  const onTrim = () => {
    if (audioBuffer) {
      const sampleRate = audioBuffer.sampleRate;
      const newBuffer = audioContext.createBuffer(
        audioBuffer.numberOfChannels,
        (end - start) * sampleRate,
        sampleRate
      );

      for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
        const inputData = audioBuffer.getChannelData(channel);
        const outputData = newBuffer.getChannelData(channel);

        for (
          let i = start * sampleRate, j = 0;
          i < end * sampleRate;
          i++, j++
        ) {
          outputData[j] = inputData[i];
        }
      }

      if (audioSource) {
        audioSource.stop(); // Stop playback of the original audio
      }

      const wavData = toWav(newBuffer);
      const blob = new Blob([new Uint8Array(wavData)], { type: "audio/wav" });
      const url = URL.createObjectURL(blob);

      setDownloadLink(url);
    }
  };

  return (
    <div>
      <input type="file" name="audio" id="audio" onChange={onUpload} />
      <input
        type="range"
        min="0"
        max={audioBuffer ? audioBuffer.duration : 0}
        value={start}
        onChange={(e) => setStart(e.target.value)}
      />
      <input
        type="range"
        min="0"
        max={audioBuffer ? audioBuffer.duration : 0}
        value={end}
        onChange={(e) => setEnd(e.target.value)}
      />
      <button onClick={onTrim}>Trim</button>
      {downloadLink && (
        <audio src={downloadLink} controls>
          Download Trimmed Audio (WAV)
        </audio>
      )}
      {downloadLink && (
        <a href={downloadLink} download="trimmed-audio.wav">
          Download Trimmed Audio (WAV)
        </a>
      )}
    </div>
  );
};

export default AudioTrim;
