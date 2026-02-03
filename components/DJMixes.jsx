import { mixes } from "../data/mixes";

function DJMixes({ onPlay }) {
  return (
    <section className="dj-mixes-section">
      <h2>DJ Mixes - What's hot</h2>

      <div className="dj-mixes">
        {mixes
      .filter(m => !m.ai)
      .map((m, i) => (
     <div key={i} className="dj-mix-card">
      <img src={m.cover} alt={m.title} />
      <h3>{m.title}</h3>
      <p>{m.dj}</p>
      <button onClick={() => onPlay(i)}>▶ Play</button>
     </div>
     ))}
      </div>
     </section>
     );
      }

      export default DJMixes;
