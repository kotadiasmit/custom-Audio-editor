import { useState, useEffect } from "react";
import { useRef } from "react";
import WaveSurfer from "wavesurfer.js";
import MinimapPlugin from "wavesurfer.js/dist/plugins/minimap.esm.js";
import RegionsPlugin from "wavesurfer.js/dist/plugins/regions.esm.js";
import TimelinePlugin from "wavesurfer.js/dist/plugins/timeline.esm.js";
import AudioEditor from "./audioEditor";

const minimap = MinimapPlugin.create({
  //for Register the plugin
  height: 20,
  waveColor: "#ddd",
  progressColor: "#999",
  // the Minimap takes all the same options as the WaveSurfer itself
});
const topTimeline = TimelinePlugin.create({
  height: 15,
  insertPosition: "beforebegin",
  timeInterval: 0.5,
  primaryLabelInterval: 5,
  secondaryLabelInterval: 0,
  style: {
    "margin-bottom": "10px",
    "font-size": "10px",
    color: "#000000",
  },
});
const initialOptions = {
  container: "#mainContainer",
  height: 120,
  splitChannels: false,
  normalize: false,
  waveColor: "#ff4e00",
  progressColor: "#dd5e98",
  cursorColor: "#ddd5e9",
  cursorWidth: 2,
  barRadius: null,
  barHeight: null,
  barAlign: "",
  fillParent: true,
  mediaControls: true,
  autoplay: false,
  interact: true,
  hideScrollbar: false,
  audioRate: 1,
  autoScroll: true,
  autoCenter: true,
  sampleRate: 8000,
  plugins: [minimap, topTimeline],
};

const WaveformOptions = () => {
  const [options, setOptions] = useState({
    barWidth: 1,
    barGap: 1,
    url: "/Maan Meri Jaan_64(PagalWorld.com.pe).mp3",
    minPxPerSec: 25,
  });
  const [loop, setLoop] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  const wavesurferRef = useRef(null);
  //console.log(currentTime);
  useEffect(() => {
    console.log(wavesurferRef.current);
    if (wavesurferRef.current) {
      wavesurferRef.current.destroy();
    }
    const wavesurferInstance = WaveSurfer.create({
      ...initialOptions,
      ...options,
    });

    wavesurferInstance.on("ready", () => {
      wavesurferInstance.setTime(0);
    });
    wavesurferInstance.on("timeupdate", (currentTime) => {
      setCurrentTime(currentTime);
      //console.log("time:" + currentTime + "s");
    });

    const wsRegions = wavesurferInstance.registerPlugin(RegionsPlugin.create());
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
  }, [options, loop]);

  const handleTrim = async () => {
    console.log(123);
    console.log(wavesurferRef.current);
    if (wavesurferRef.current) {
      // get start and end points of the selected region
      const region = wavesurferRef.current.plugins[2].regions[0];
      console.log(region);
      if (region) {
        const start = region.start;
        const end = region.end;

        // obtain the original array of the audio
        // const original_buffer = wavesurferRef.current.backend.buffer;
        const original_buffer = wavesurferRef.current.decodedData;
        console.log(original_buffer);
        // create a temporary new buffer array with the same length, sample rate and no of channels as the original audio
        const new_buffer = wavesurferRef.current.decodedData;
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
        wavesurferRef.current.loadDecodedBuffer(new_buffer);
      }
    }
  };

  const handleInputChange = (e) => {
    let { value, id } = e.target;

    if (id === "uploadedAudio") {
      value = URL.createObjectURL(e.target.files[0]);
      id = "url";
    }
    console.log(id, value);
    setOptions((prevOptions) => ({
      ...prevOptions,
      [id]: value,
    }));
  };

  return (
    <AudioEditor
      handleInputChange={handleInputChange}
      options={options}
      setLoop={setLoop}
      handleTrim={handleTrim}
    />
  );
};

export default WaveformOptions;
