import { useState, useEffect, useRef } from "react";
import WaveSurfer from "wavesurfer.js";
import toWav from "audiobuffer-to-wav";
import Regions from "wavesurfer.js/plugins/regions";
import AudioEditor from "./audioEditor";
import initialOptions from "./initialOptions";

const WaveformOptions = () => {
  const [wavesurferObj, setWavesurferObj] = useState();
  const [options, setOptions] = useState({
    barWidth: 1,
    barHeight: 1,
    barGap: 1,
    autoCenter: false,
    minPxPerSec: 25,
  });
  const [audioBuffer, setAudioBuffer] = useState("");
  const [audio, setAudio] = useState({
    name: "",
    url: "",
  });
  const [loop, setLoop] = useState(false);

  const wavesurferRef = useRef(null);
  useEffect(() => {
    if (wavesurferObj) {
      wavesurferObj.setOptions(options);
    }
  }, [options]);

  useEffect(() => {
    if (wavesurferRef.current) {
      wavesurferRef.current.destroy();
    }
    const wavesurferInstance = WaveSurfer.create({
      ...initialOptions,
      ...options,
      url: audio.url,
    });
    setWavesurferObj(wavesurferInstance);

    wavesurferInstance.on("ready", () => {
      wavesurferInstance.setTime(0);
    });

    const wsRegions = wavesurferInstance.registerPlugin(Regions.create());

    wavesurferInstance.on("decode", () => {
      wsRegions.addRegion({
        start: 0,
        end: 8,
        content: "Trim",
        color: "rgba(255, 0, 0, 0.1)",
        drag: true,
        resize: true,
      });
      // ... Add more regions as needed
    });

    wsRegions.enableDragSelection({
      color: "rgba(255, 0, 0, 0.1)",
    });

    wsRegions.on("region-updated", (region) => {});

    let activeRegion = null;
    wsRegions.on("region-in", (region) => {
      activeRegion = region;
    });
    wsRegions.on("region-out", (region) => {
      if (activeRegion === region) {
        if (loop) {
          region.play();
        } else {
          activeRegion = null;
        }
      }
    });
    wsRegions.on("region-clicked", (region, e) => {
      e.stopPropagation();
      activeRegion = region;
      region.play();
    });
    wavesurferInstance.on("interaction", () => {
      activeRegion = null;
    });

    wavesurferRef.current = wavesurferInstance;
    return () => {
      if (wavesurferRef.current) {
        wavesurferRef.current.destroy();
      }
    };
  }, [loop, audio]);

  const handleInputChange = async (e) => {
    let { value, id } = e.target;

    if (id === "uploadedAudio") {
      value = e.target.files[0];
      if (value) {
        const audioDetails = {
          name: value.name,
          url: URL.createObjectURL(value),
        };
        setAudio(audioDetails);

        //set AudioBuffer for trimming purpose
        const arrayBuffer = await value.arrayBuffer();
        const audioCtx = new (window.AudioContext ||
          window.webkitAudioContext)();
        audioCtx.decodeAudioData(arrayBuffer, (buffer) => {
          setAudioBuffer(buffer);
        });
      }
    } else if (id === "autoCenter") {
      setOptions((prevOptions) => ({
        ...prevOptions,
        [id]: !options.autoCenter,
      }));
    } else {
      setOptions((prevOptions) => ({
        ...prevOptions,
        [id]: value,
      }));
    }
  };

  const handleTrim = async () => {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    console.log(wavesurferObj);
    if (wavesurferObj) {
      // get start and end points of the selected region
      const region = wavesurferObj.plugins[2].regions[0];
      console.log(region);
      if (region) {
        const start = region.start;
        const end = region.end;
        console.log(audio);
        console.log(audioBuffer);

        const sampleRate = audioBuffer.sampleRate;
        console.log(sampleRate);

        //cerate a new buffer for trimming
        const newBuffer = audioCtx.createBuffer(
          audioBuffer.numberOfChannels,
          (end - start) * sampleRate,
          sampleRate
        );

        // get data from oldBuffer(audioBuffer) & set it in newBuffer.
        for (
          let channel = 0;
          channel < audioBuffer.numberOfChannels;
          channel++
        ) {
          const inputData = audioBuffer.getChannelData(channel);
          const outputData = newBuffer.getChannelData(channel);

          for (
            let i = Math.ceil(start * sampleRate), j = 0;
            i < end * sampleRate;
            i++, j++
          ) {
            i === Math.ceil(start * sampleRate) && console.log(i);
            outputData[j] = inputData[i];
          }
        }

        //create a new blob for audio to create a url
        const wavData = toWav(newBuffer);
        const blob = new Blob([new Uint8Array(wavData)], { type: "audio/wav" });
        const url = URL.createObjectURL(blob);

        // Fetch the audio data from the URL for setting new AudioBuffer
        const response = await fetch(url);
        console.log(response);
        const arrayBuffer = await response.arrayBuffer();
        audioCtx.decodeAudioData(arrayBuffer, (buffer) => {
          setAudioBuffer(buffer);
        });
        setAudio((prev) => ({ ...prev, url }));
      }
    }
  };

  return (
    <>
      {audio.name ? (
        <h3 title="audio name">{audio.name}</h3>
      ) : (
        <h2>Please Upload Music</h2>
      )}
      <AudioEditor
        handleInputChange={handleInputChange}
        options={options}
        setLoop={setLoop}
        handleTrim={handleTrim}
      />
    </>
  );
};

export default WaveformOptions;
