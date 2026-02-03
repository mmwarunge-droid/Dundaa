function GlobalPlayer({ mix, player }) {
  if (!mix) return null;

  return (
    <div className="global-player">
      <img src={mix.cover} />

      <div className="player-info">
        <h4>{mix.title}</h4>
        <p>{mix.dj}</p>

        <div className="progress-wrapper">
          <span>{player.time.current}</span>
          <input
            type="range"
            value={player.progress}
            onChange={(e) => player.seek(e.target.value)}
          />
          <span>{player.time.duration}</span>
        </div>
      </div>

      <div className="player-controls">
        <button onClick={player.toggle}>
          {player.playing ? "⏸" : "▶"}
        </button>
      </div>
    </div>
  );
}

export default GlobalPlayer;
