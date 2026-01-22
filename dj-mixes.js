/* ================= DJ MIXES APP ================= */

const DJ_MIXES_API = "https://example.com/api/dj-mixes"; // Replace with your real API

let audio = new Audio();
let currentMix = null;
let allMixes = [];
let currentUser = JSON.parse(localStorage.getItem("user")) || null;
let userSubscription = JSON.parse(localStorage.getItem("subscription")) || "free"; // "free" | "premium"

/* ================= ELEMENTS ================= */
const mixesContainer = document.getElementById("dj-mixes");
const globalPlayer = document.getElementById("global-player");
const playPauseBtn = document.getElementById("play-pause-btn");
const likeBtn = document.getElementById("like-btn");
const progressBar = document.getElementById("progress-bar");
const currentTimeEl = document.getElementById("current-time");
const durationEl = document.getElementById("duration");
const titleEl = document.getElementById("player-title");
const djEl = document.getElementById("player-dj");
const coverEl = document.getElementById("player-cover");
const searchInput = document.getElementById("mix-search");
const aiBox = document.getElementById("ai-mixes");
const canvas = document.getElementById("waveform");
const ctx = canvas.getContext("2d");

/* ================= FETCH DJ MIXES ================= */
async function fetchDjMixes() {
    try {
        const res = await fetch(DJ_MIXES_API);
        allMixes = await res.json();
        renderDjMixes(allMixes);
        renderAI();
    } catch (err) {
        console.error("Error fetching DJ mixes:", err);
    }
}

/* ================= RENDER DJ MIX CARDS ================= */
function renderDjMixes(mixes) {
    mixesContainer.innerHTML = "";
    mixes.forEach(mix => {
        const card = document.createElement("div");
        card.className = "dj-mix-card";

        card.innerHTML = `
            <img src="${mix.coverImage}" alt="${mix.title}">
            <h3>${mix.title}</h3>
            <p>${mix.dj}</p>
            <button>${currentMix === mix && !audio.paused ? "⏸" : "▶"} Play</button>
        `;

        card.querySelector("button").onclick = () => playMix(mix);
        mixesContainer.appendChild(card);
    });
}

/* ================= PLAY MIX ================= */
function playMix(mix) {
    if (mix.premium && !isPremium()) {
        alert("Upgrade to Premium to play this mix");
        return;
    }

    currentMix = mix;
    audio.src = mix.audioUrl;
    audio.currentTime = getSavedTime(mix.audioUrl);
    audio.play();

    titleEl.textContent = mix.title;
    djEl.textContent = mix.dj;
    coverEl.src = mix.coverImage;

    globalPlayer.classList.remove("hidden");
    playPauseBtn.textContent = "⏸";

    updateLikeState();
    trackPlay(mix);
}

/* ================= PLAYER CONTROLS ================= */
playPauseBtn.onclick = () => {
    if (audio.paused) {
        audio.play();
        playPauseBtn.textContent = "⏸";
    } else {
        audio.pause();
        playPauseBtn.textContent = "▶";
    }
};

likeBtn.onclick = () => {
    toggleLike(currentMix);
    updateLikeState();
};

/* ================= PROGRESS BAR & TIME ================= */
audio.ontimeupdate = () => {
    progressBar.value = (audio.currentTime / audio.duration) * 100 || 0;
    currentTimeEl.textContent = formatTime(audio.currentTime);
    durationEl.textContent = formatTime(audio.duration);
    savePlaybackTime(currentMix.audioUrl, audio.currentTime);
};

progressBar.oninput = () => {
    audio.currentTime = (progressBar.value / 100) * audio.duration;
};

/* ================= LOCAL STORAGE ================= */
function savePlaybackTime(url, time) {
    localStorage.setItem(`playback-${url}`, time);
}

function getSavedTime(url) {
    return Number(localStorage.getItem(`playback-${url}`)) || 0;
}

function toggleLike(mix) {
    let liked = JSON.parse(localStorage.getItem("likedMixes")) || [];
    const exists = liked.find(m => m.audioUrl === mix.audioUrl);

    liked = exists ? liked.filter(m => m.audioUrl !== mix.audioUrl) : [...liked, mix];
    localStorage.setItem("likedMixes", JSON.stringify(liked));
}

function updateLikeState() {
    const liked = JSON.parse(localStorage.getItem("likedMixes")) || [];
    likeBtn.textContent = liked.some(m => m.audioUrl === currentMix.audioUrl) ? "❤️" : "🤍";
}

/* ================= HELPER FUNCTIONS ================= */
function formatTime(time) {
    if (!time) return "0:00";
    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60).toString().padStart(2, "0");
    return `${min}:${sec}`;
}

function isPremium() {
    return userSubscription === "premium";
}

/* ================= SEARCH ================= */
searchInput.addEventListener("input", () => {
    const q = searchInput.value.toLowerCase();
    const filtered = allMixes.filter(m =>
        m.title.toLowerCase().includes(q) ||
        m.dj.toLowerCase().includes(q) ||
        m.genre?.toLowerCase().includes(q)
    );
    renderDjMixes(filtered);
});

/* ================= PLAYLISTS ================= */
function getPlaylists() {
    return JSON.parse(localStorage.getItem("playlists")) || [];
}

function savePlaylists(p) {
    localStorage.setItem("playlists", JSON.stringify(p));
}

function createPlaylist(name) {
    const playlists = getPlaylists();
    playlists.push({ id: Date.now(), name, mixes: [] });
    savePlaylists(playlists);
}

function addToPlaylist(playlistId, mix) {
    const playlists = getPlaylists();
    const playlist = playlists.find(p => p.id === playlistId);
    if (!playlist.mixes.find(m => m.audioUrl === mix.audioUrl)) {
        playlist.mixes.push(mix);
    }
    savePlaylists(playlists);
}

/* ================= OFFLINE DOWNLOAD ================= */
async function downloadMix(mix) {
    const cache = await caches.open("dundaa-mixes");
    await cache.add(mix.audioUrl);
    alert("Mix saved for offline use");
}

/* ================= ANALYTICS ================= */
function trackPlay(mix) {
    const stats = JSON.parse(localStorage.getItem("mixStats")) || {};
    stats[mix.audioUrl] = (stats[mix.audioUrl] || 0) + 1;
    localStorage.setItem("mixStats", JSON.stringify(stats));
}

function getPopularMixes() {
    const stats = JSON.parse(localStorage.getItem("mixStats")) || {};
    return allMixes
        .map(m => ({ ...m, plays: stats[m.audioUrl] || 0 }))
        .sort((a, b) => b.plays - a.plays)
        .slice(0, 10);
}

/* ================= AI RECOMMENDATIONS ================= */
function recommendMixes() {
    const stats = JSON.parse(localStorage.getItem("mixStats")) || {};
    const liked = JSON.parse(localStorage.getItem("likedMixes")) || [];

    return allMixes
        .map(mix => ({
            ...mix,
            score: (stats[mix.audioUrl] || 0) + (liked.find(l => l.audioUrl === mix.audioUrl) ? 5 : 0)
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);
}

function renderAI() {
    aiBox.innerHTML = "";
    recommendMixes().forEach(mix => {
        aiBox.innerHTML += `<p>${mix.title} — ${mix.dj}</p>`;
    });
}

/* ================= WAVEFORM VISUALIZER ================= */
const audioCtx = new AudioContext();
const analyser = audioCtx.createAnalyser();
const source = audioCtx.createMediaElementSource(audio);
source.connect(analyser);
analyser.connect(audioCtx.destination);

function drawWaveform() {
    requestAnimationFrame(drawWaveform);
    const data = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteTimeDomainData(data);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    data.forEach((v, i) => {
        const x = (i / data.length) * canvas.width;
        const y = (v / 255) * canvas.height;
        ctx.lineTo(x, y);
    });
    ctx.strokeStyle = "#D4AF37";
    ctx.stroke();
}
drawWaveform();

/* ================= INITIALIZE ================= */
fetchDjMixes();
