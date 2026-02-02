import { useEffect, useRef } from "react";

function Waveform({ audioRef }) {
  const canvasRef = useRef();
  const audioContextRef = useRef(null);
  const sourceRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    if (!audioRef.current) return;

    // Create AudioContext once
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
    const ctx = audioContextRef.current;

    // Only create MediaElementSource once
    if (!sourceRef.current) {
      sourceRef.current = ctx.createMediaElementSource(audioRef.current);

      const analyser = ctx.createAnalyser();
      sourceRef.current.connect(analyser);
      analyser.connect(ctx.destination);

      analyser.fftSize = 256;
      const data = new Uint8Array(analyser.frequencyBinCount);

      const canvas = canvasRef.current;
      const c = canvas.getContext("2d");

      const draw = () => {
        animationRef.current = requestAnimationFrame(draw);
        analyser.getByteTimeDomainData(data);
        c.clearRect(0, 0, canvas.width, canvas.height);
        c.strokeStyle = "#FFD400";
        c.beginPath();
        data.forEach((v, i) => {
          const x = (i / data.length) * canvas.width;
          const y = (v / 255) * canvas.height;
          i === 0 ? c.moveTo(x, y) : c.lineTo(x, y);
        });
        c.stroke();
      };

      draw();
    }

    return () => {
      // Cancel animation frame on unmount
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      // Do not disconnect the MediaElementSource, cannot reconnect same audio
    };
  }, [audioRef]);

  return <canvas ref={canvasRef} className="waveform" width={600} height={100} />;
}

export default Waveform;
