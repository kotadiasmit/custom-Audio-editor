import { useState, useEffect } from "react";
import { useRef } from "react";
import WaveSurfer from "wavesurfer.js";
//import Regions from "wavesurfer.js/dist/plugins/regions.esm.js";
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
  const [audio, setAudio] = useState({
    name: "Maan Meri Jaan_64(PagalWorld.com.pe).mp3",
    url: "/Maan Meri Jaan_64(PagalWorld.com.pe).mp3",
  });
  const [loop, setLoop] = useState(false);

  const wavesurferRef = useRef(null);
  //console.log(currentTime);
  useEffect(() => {
    if (wavesurferObj) {
      wavesurferObj.setOptions(options);
    }
  }, [options]);

  useEffect(() => {
    console.log(wavesurferRef.current);
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
    wavesurferInstance.on("timeupdate", (currentTime) => {
      //console.log("time:" + currentTime + "s");
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

    wsRegions.on("region-updated", (region) => {
      console.log("Updated region", region);
    });

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

  const handleInputChange = (e) => {
    let { value, id } = e.target;
    console.log(value, id);

    if (id === "uploadedAudio") {
      value = e.target.files[0];
      const audioDetails = {
        name: value.name,
        url: URL.createObjectURL(value),
      };
      setAudio(audioDetails);
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
    console.log(wavesurferObj);
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    console.log(audioCtx);
    console.log(123);
    console.log(wavesurferObj);
    if (wavesurferObj) {
      // get start and end points of the selected region
      const region = wavesurferObj.plugins[2].regions[0];
      console.log(region);
      if (region) {
        const start = region.start;
        const end = region.end;

        // obtain the original array of the audio
        //const original = wavesurferObj.backend.buffer;
        const original_buffer = wavesurferObj.getDecodedData();
        console.log(original_buffer);
        // create a temporary new buffer array with the same length, sample rate and no of channels as the original audio
        const new_buffer = wavesurferObj.getDecodedData();
        console.log(new_buffer);

        // create 2 indices:
        // left & right to the part to be trimmed
        const first_list_index = start * original_buffer.sampleRate;
        const second_list_index = end * original_buffer.sampleRate;
        const second_list_mem_alloc =
          original_buffer.length - end * original_buffer.sampleRate;

        // create a new array upto the region to be trimmed
        const new_list = new Float32Array(parseInt(first_list_index));

        // create a new array of region after the trimmed region
        const second_list = new Float32Array(parseInt(second_list_mem_alloc));

        // create an array to combine the 2 parts
        const combined = new Float32Array(original_buffer.length);

        // 2 channels: 1-right, 0-left
        // copy the buffer values for the 2 regions from the original buffer

        // for the region to the left of the trimmed section
        original_buffer.copyFromChannel(new_list, 1);
        original_buffer.copyFromChannel(new_list, 0);

        // for the region to the right of the trimmed section
        original_buffer.copyFromChannel(second_list, 1, second_list_index);
        original_buffer.copyFromChannel(second_list, 0, second_list_index);

        // create the combined buffer for the trimmed audio
        combined.set(new_list);
        combined.set(second_list, first_list_index);

        // copy the combined array to the new_buffer
        new_buffer.copyToChannel(combined, 1);
        new_buffer.copyToChannel(combined, 0);
        console.log(new_buffer);
        // load the new_buffer, to restart the wavesurfer's waveform display
        wavesurferObj.loadDecodedBuffer(new_buffer);
      }
    }
  };

  return (
    <>
      <h3 title="audio name">{audio.name}</h3>
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
