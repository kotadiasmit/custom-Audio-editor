import { useState, useEffect } from "react";
import { useRef } from "react";
import WaveSurfer from "wavesurfer.js";
import Minimap from "wavesurfer.js/dist/plugins/minimap.esm.js";
import RegionsPlugin from "wavesurfer.js/dist/plugins/regions.esm.js";
import AudioEditor from "./audioEditor";

const initialOptions = {
  container: "#mainContainer",
  height: 128,
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
};

const WaveformOptions = () => {
  const [options, setOptions] = useState({
    barWidth: 5,
    barGap: 5,
    url: "/Maan Meri Jaan_64(PagalWorld.com.pe).mp3",
    minPxPerSec: 10,
  });

  //console.log(options.barWidth);
  const wavesurferRef = useRef(null);

  useEffect(() => {
    if (wavesurferRef.current) {
      wavesurferRef.current.destroy();
    }

    const wavesurferInstance = WaveSurfer.create({
      ...initialOptions,
      ...options,
      plugins: [
        // Register the plugin
        Minimap.create({
          height: 20,
          waveColor: "#ddd",
          progressColor: "#999",
          // the Minimap takes all the same options as the WaveSurfer itself
        }),
      ],
    });
    wavesurferInstance.on("ready", () => {
      wavesurferInstance.setTime(10);
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

    let loop = true;
    // document.querySelector('input[type="checkbox"]').onclick = (e) => {
    //   loop = e.target.checked;
    // };

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
  }, [options]);

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
    <AudioEditor handleInputChange={handleInputChange} options={options} />
  );
};

export default WaveformOptions;
