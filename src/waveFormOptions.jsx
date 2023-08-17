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
    />
  );
};

export default WaveformOptions;
