/* =========================================================
   Dundaa Global Audio Player – ES6 Production Build
   Waveform + Queue + Offline Ready
   ========================================================= */

(() => {
  "use strict";

  /* ===================== DOM ===================== */
  const DOM = {
    mixesContainer: document.getElementById("dj-mixes"),
    aiMixesContainer: document.getElementById("ai-mixes"),

    player: document.getElementById("global-player"),
    cover: document.getElementById("player-cover"),
    title: document.getElementById("player-title"),
    dj: document.getElementById("player-dj"),

    playPauseBtn: document.getElementById("play-pause-btn"),
    likeBtn: document.getElementById("like-btn"),

    progressBar: document.getElementById("progress-bar"),
    currentTime: document.getElementById("current-time"),
    duration: document.getElementById("duration"),

    searchInput: document.getElementById("mix-search"),
    canvas: document.getElementById("waveform"),
  };

  /* ===================== STATE ===================== */
  const state = {
    audio: new Audio(),
    queue: [],
    currentIndex: -1,
    isPlaying: false,
    audioCtx: null,
    analyser: null,
    sourceNode: null,
  };

  state.audio.preload = "none";
  state.audio.crossOrigin = "anonymous";

  /* ===================== MIX DATA ===================== */
  const MIXES = [
    {
      id: 1,
      title: "Amapiano Nights",
      dj: "DJ Flex",
      cover: "./images/deejay.jpg",
      src: "./audio/mix1.mp3",
      ai: true,
    },
    {
      id: 2,
      title: "Club Bangers",
      dj: "DJ Nova",
      cover: "./images/event1.jpg",
      src: "./audio/mix2.mp3",
      ai: false,
    },
  ];

  state.queue = [...MIXES];

  /* ===================== UTIL ===================== */
  const formatTime = (t) => {
    if (!t || isNaN(t)) return "0:00";
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const showPlayer = () => DOM.player.classList.remove("hidden");

  /* ===================== QUEUE LOGIC ===================== */
  const loadByIndex = (index) => {
    if (index < 0 || index >= state.queue.length) return;

    const mix = state.queue[index];
    state.currentIndex = index;

    state.audio.src = mix.src;
    state.audio.load();

    DOM.cover.src = mix.cover;
    DOM.title.textContent = mix.title;
    DOM.dj.textContent = mix.dj;

    showPlayer();
    initAudioContext();
  };

  const next = () => {
    const nextIndex = (state.currentIndex + 1) % state.queue.length;
    loadByIndex(nextIndex);
    play();
  };

  const prev = () => {
    const prevIndex =
      (state.currentIndex - 1 + state.queue.length) % state.queue.length;
    loadByIndex(prevIndex);
    play();
  };

  /* ===================== PLAYBACK ===================== */
  const play = async () => {
    try {
      await state.audio.play();
      state.isPlaying = true;
      DOM.playPauseBtn.textContent = "⏸";
      drawWaveform();
    } catch {
      console.warn("Playback blocked until user interaction");
    }
  };

  const pause = () => {
    state.audio.pause();
    state.isPlaying = false;
    DOM.playPauseBtn.textContent = "▶";
  };

  DOM.playPauseBtn.addEventListener("click", () =>
    state.isPlaying ? pause() : play()
  );

  state.audio.addEventListener("ended", next);

  /* ===================== PROGRESS ===================== */
  state.audio.addEventListener("timeupdate", () => {
    if (!state.audio.duration) return;
    DOM.currentTime.textContent = formatTime(state.audio.currentTime);
    DOM.duration.textContent = formatTime(state.audio.duration);
    DOM.progressBar.value =
      (state.audio.currentTime / state.audio.duration) * 100;
  });

  DOM.progressBar.addEventListener("input", () => {
    if (!state.audio.duration) return;
    state.audio.currentTime =
      (DOM.progressBar.value / 100) * state.audio.duration;
  });

  /* ===================== WAVEFORM ===================== */
  const initAudioContext = () => {
    if (state.audioCtx) return;

    state.audioCtx = new (window.AudioContext ||
      window.webkitAudioContext)();
    state.analyser = state.audioCtx.createAnalyser();
    state.analyser.fftSize = 2048;

    state.sourceNode =
      state.audioCtx.createMediaElementSource(state.audio);
    state.sourceNode.connect(state.analyser);
    state.analyser.connect(state.audioCtx.destination);
  };

  const drawWaveform = () => {
    if (!DOM.canvas || !state.analyser) return;

    const ctx = DOM.canvas.getContext("2d");
    const buffer = new Uint8Array(state.analyser.frequencyBinCount);

    const render = () => {
      if (!state.isPlaying) return;

      requestAnimationFrame(render);
      state.analyser.getByteTimeDomainData(buffer);

      ctx.clearRect(0, 0, DOM.canvas.width, DOM.canvas.height);
      ctx.beginPath();

      buffer.forEach((v, i) => {
        const x = (i / buffer.length) * DOM.canvas.width;
        const y = (v / 255) * DOM.canvas.height;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      });

      ctx.strokeStyle = "#d4af37";
      ctx.lineWidth = 2;
      ctx.stroke();
    };

    render();
  };

  /* ===================== MIX CARDS ===================== */
  const createMixCard = (mix, index) => {
    const card = document.createElement("article");
    card.className = "dj-mix-card";
    card.innerHTML = `
      <img src="${mix.cover}" loading="lazy">
      <h4>${mix.title}</h4>
      <p>${mix.dj}</p>
      <button>▶ Play</button>
    `;

    card.querySelector("button").onclick = () => {
      loadByIndex(index);
      play();
    };

    return card;
  };

  const renderMixes = (container, list) => {
    list.forEach((mix, i) =>
      container.appendChild(createMixCard(mix, i))
    );
  };

  /* ===================== LAZY LOAD ===================== */
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      renderMixes(e.target, state.queue);
      obs.unobserve(e.target);
    });
  });

  observer.observe(DOM.mixesContainer);
  observer.observe(DOM.aiMixesContainer);

  /* ===================== SEARCH ===================== */
  DOM.searchInput.addEventListener("input", (e) => {
    const q = e.target.value.toLowerCase();
    [...DOM.mixesContainer.children].forEach((card) => {
      card.style.display = card.textContent.toLowerCase().includes(q)
        ? "block"
        : "none";
    });
  });

  /* ===================== PWA REG ===================== */
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js");
  }

})();
