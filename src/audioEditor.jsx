const AudioEditor = ({ handleInputChange, options, setLoop, handleTrim }) => {
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
            className="form-input "
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
            className="form-input "
            value={options.minPxPerSec}
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
            className="form-input "
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
            className="form-input"
            onChange={(e) => handleInputChange(e)}
          />
        </div>
        <div className="form-sub-container">
          <label className="form-label" htmlFor="loop">
            Trim Loop
          </label>
          <input
            type="checkBox"
            id="loop"
            onChange={() => setLoop((prev) => !prev)}
          />
        </div>
        <button className="trim-btn" type="button" onClick={handleTrim}>
          Trim Song
        </button>
      </form>
    </div>
  );
};

export default AudioEditor;
