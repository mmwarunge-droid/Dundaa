import { useRef, useState, useEffect } from "react";

export function useAudioPlayer(queue) {
  const audioRef = useRef(new Audio());
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [time, setTime] = useState({ current: "0:00", duration: "0:00" });

  const play = (i) => {
    const audio = audioRef.current;
    const mix = queue[i];
    setIndex(i);
    audio.src = mix.src;
    audio.play();
    setPlaying(true);

    if ("mediaSession" in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: mix.title,
        artist: mix.dj,
        artwork: [{ src: mix.cover, sizes: "512x512" }]
      });
    }
  };

  useEffect(() => {
    const audio = audioRef.current;

    audio.ontimeupdate = () => {
      const pct = (audio.currentTime / audio.duration) * 100 || 0;
      setProgress(pct);
      setTime({
        current: format(audio.currentTime),
        duration: format(audio.duration)
      });
    };
  }, []);

  const toggle = () => {
    const audio = audioRef.current;
    audio.paused ? audio.play() : audio.pause();
    setPlaying(!audio.paused);
  };

  const seek = (v) => {
    const audio = audioRef.current;
    audio.currentTime = (v / 100) * audio.duration;
  };

  const format = (s) => {
    if (!s) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec < 10 ? "0" : ""}${sec}`;
  };

  return { play, toggle, seek, index, playing, progress, time, audioRef };
}
