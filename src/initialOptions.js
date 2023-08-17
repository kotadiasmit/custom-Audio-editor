import MinimapPlugin from "wavesurfer.js/dist/plugins/minimap.esm.js";
import TimelinePlugin from "wavesurfer.js/dist/plugins/timeline.esm.js";

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
  secondaryLabelInterval: 2.5,
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
  barWidth: 1,
  barGap: 1,
  url: "/Maan Meri Jaan_64(PagalWorld.com.pe).mp3",
  minPxPerSec: 25,
  sampleRate: 8000,
  plugins: [minimap, topTimeline],
};

export default initialOptions;
