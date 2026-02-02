import { mixes } from "./data/mixes";
import { useAudioPlayer } from "./hooks/useAudioPlayer";

import DJMixes from "./components/DJMixes";
import AIRecommendations from "./components/AIRecommendations";
import GlobalPlayer from "./components/GlobalPlayer";
import Waveform from "./components/Waveform";
import "./styles/App.css";

function App() {
  const player = useAudioPlayer(mixes);
  const currentMix = mixes[player.index];

  return (
    <div className="app-container">
      <h1 style={{ color: "#FFD400", textAlign: "center" }}>Dundaa is alive 🔥</h1>

      {/* Waveform */}
      <Waveform audioRef={player.audioRef} />

      {/* DJ Mix List */}
      <DJMixes onPlay={player.play} />

      {/* AI Recommendations */}
      <AIRecommendations onPlay={player.play} />

      {/* Global Audio Player */}
      <GlobalPlayer mix={currentMix} player={player} />
    </div>
  );
}

export default App;
