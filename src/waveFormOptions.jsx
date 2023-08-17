import { useState, useEffect } from "react";
import { useRef } from "react";
import WaveSurfer from "wavesurfer.js";
import Minimap from "wavesurfer.js/dist/plugins/minimap.esm.js";
import RegionsPlugin from "wavesurfer.js/dist/plugins/regions.esm.js";

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

    const random = (min, max) => Math.random() * (max - min) + min;
    const randomColor = () =>
      `rgba(${random(0, 255)}, ${random(0, 255)}, ${random(0, 255)}, 0.5)`;

    wavesurferInstance.on("decode", () => {
      wsRegions.addRegion({
        start: 0,
        end: 8,
        content: "Trim",
        color: randomColor(),
        drag: false,
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
      region.setOptions({ color: randomColor() });
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
    <div className="option-container">
      <form className="audio-form-style">
        <div className="form-sub-container">
          <label className="form-label" htmlFor="barWidth">
            Bar Width
          </label>
          <input
            step={1}
            min={1}
            max={20}
            type="range"
            id="barWidth"
            className="input-text"
            value={options.barWidth}
            onChange={(e) => handleInputChange(e)}
          />
        </div>
        <div className="form-sub-container">
          <label className="form-label" htmlFor="minPxPerSec">
            Zoom
          </label>
          <input
            step={2}
            min={10}
            max={200}
            type="range"
            id="minPxPerSec"
            className="input-text"
            onChange={(e) => handleInputChange(e)}
          />
        </div>
        <div className="form-sub-container">
          <label className="form-label" htmlFor="barGap">
            Bar Gap
          </label>
          <input
            step={1}
            min={1}
            max={9}
            type="range"
            id="barGap"
            className="input-text"
            value={options.barGap}
            onChange={(e) => handleInputChange(e)}
          />
        </div>
        <div className="form-sub-container">
          <label className="form-label" htmlFor="uploadedAudio">
            Upload Song
          </label>
          <input
            accept="audio/*"
            capture="microphone"
            type="file"
            id="uploadedAudio"
            className="input-text"
            onChange={(e) => handleInputChange(e)}
          />
        </div>
      </form>
    </div>
  );
};

export default WaveformOptions;
