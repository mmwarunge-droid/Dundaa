import { mixes } from "../data/mixes";

function AIRecommendations({ onPlay }) {
  return (
    <section className="ai-recommendations">
      <h2>🤖 Recommended For You</h2>

      <div className="dj-mixes">
        {mixes
      .filter(m => m.ai)
      .map((m, i) => (
     <div key={i} className="dj-mix-card">
      <img src={m.cover} alt={m.title} />
      <h3>{m.title}</h3>
      <p>AI Curated</p>
      <button onClick={() => onPlay(i)}>▶ Play</button>
     </div>
     ))}

      </div>
    </section>
  );
}

export default AIRecommendations;
