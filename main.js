/* ===============================
   DUNDAA CORE + DJ MIX PLAYER
   =============================== */

document.addEventListener("DOMContentLoaded", initApp);

/* ================= APP BOOTSTRAP ================= */
function initApp() {
    initNavigation();
    initTicketButtons();
    initEventCards();
    initForms();
    initSmoothScroll();
    initThemeToggle();
    initDJMixes();
    initServiceWorker();
}

/* ================= NAVIGATION ================= */
function initNavigation() {
    const nav = document.querySelector(".main-nav");
    const header = document.querySelector(".site-header");
    if (!nav || !header) return;

    const burger = document.createElement("button");
    burger.className = "nav-toggle";
    burger.setAttribute("aria-label", "Toggle navigation");
    burger.textContent = "☰";
    header.appendChild(burger);

    burger.addEventListener("click", () => nav.classList.toggle("nav-open"));
    window.addEventListener("resize", () => {
        if (window.innerWidth > 768) nav.classList.remove("nav-open");
    });
}

/* ================= TICKET BUTTONS ================= */
function initTicketButtons() {
    document.querySelectorAll(".buy-btn").forEach(btn => {
        btn.addEventListener("click", e => {
            e.preventDefault();
            btn.textContent = "Processing...";
            btn.style.opacity = "0.7";
            setTimeout(() => {
                const link = btn.getAttribute("href");
                if (link) window.location.href = link;
            }, 600);
        });
    });
}

/* ================= EVENT CARDS ================= */
function initEventCards() {
    document.querySelectorAll(".event-card").forEach(card => {
        card.addEventListener("pointerenter", () => card.classList.add("active"));
        card.addEventListener("pointerleave", () => card.classList.remove("active"));
        card.addEventListener("click", e => {
            const btn = card.querySelector(".buy-btn");
            if (btn && !e.target.closest(".buy-btn")) btn.click();
        });
    });
}

/* ================= FORMS ================= */
function initForms() {
    document.querySelectorAll("form").forEach(form => {
        form.addEventListener("submit", e => {
            e.preventDefault();
            const submitBtn = form.querySelector("button, input[type='submit']");
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = "Sending...";
            }
            setTimeout(() => {
                alert("✅ Submitted successfully!");
                form.reset();
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = "Send";
                }
            }, 800);
        });
    });
}

/* ================= SMOOTH SCROLL ================= */
function initSmoothScroll() {
    document.querySelectorAll("a[href^='#']").forEach(anchor => {
        anchor.addEventListener("click", e => {
            const target = document.querySelector(anchor.getAttribute("href"));
            if (!target) return;
            e.preventDefault();
            target.scrollIntoView({ behavior: "smooth", block: "start" });
        });
    });
}

/* ================= THEME TOGGLE ================= */
function initThemeToggle() {
    const toggleBtn = document.createElement("button");
    toggleBtn.className = "theme-toggle";
    toggleBtn.textContent = "🌙";
    document.body.appendChild(toggleBtn);

    toggleBtn.addEventListener("click", () => {
        document.body.classList.toggle("light-mode");
        toggleBtn.textContent =
            document.body.classList.contains("light-mode") ? "☀️" : "🌙";
    });
}

/* ================= DJ MIXES ================= */
function initDJMixes() {
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

    if (!mixesContainer || !canvas) return;

    const ctx = canvas.getContext("2d");
    const audio = new Audio();
    const audioCtx = new AudioContext();
    const analyser = audioCtx.createAnalyser();
    const source = audioCtx.createMediaElementSource(audio);

    source.connect(analyser);
    analyser.connect(audioCtx.destination);

    let currentMix = null;
    let allMixes = [];
    const userSubscription =
        JSON.parse(localStorage.getItem("subscription")) || "free";

    /* ---------- CANVAS ---------- */
    function resizeCanvas() {
        canvas.width = canvas.clientWidth;
        canvas.height = 100;
    }
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    document.addEventListener(
        "click",
        () => audioCtx.state === "suspended" && audioCtx.resume(),
        { once: true }
    );

    /* ---------- DATA ---------- */
    allMixes = [
        {
            title: "Sample Mix 1",
            dj: "DJ Alpha",
            audioUrl: "/audio/test1.mp3",
            coverImage: "/images/deejay.jpg",
        },
        {
            title: "Sample Mix 2",
            dj: "DJ Beta",
            audioUrl: "/audio/test2.mp3",
            coverImage: "/images/deejay2.jpg",
        },
    ];

    renderDjMixes(allMixes);
    renderAI();

    /* ---------- RENDER ---------- */
    function renderDjMixes(mixes) {
        mixesContainer.innerHTML = "";
        mixes.forEach(mix => {
            const card = document.createElement("div");
            card.className = "dj-mix-card";
            card.innerHTML = `
                <img src="${mix.coverImage}" alt="${mix.title}">
                <h3>${mix.title}</h3>
                <p>${mix.dj}</p>
                <button>▶ Play</button>
            `;
            card.querySelector("button").onclick = () => playMix(mix);
            mixesContainer.appendChild(card);
        });
    }

    function playMix(mix) {
        if (mix.premium && userSubscription !== "premium") {
            alert("Upgrade to Premium");
            return;
        }

        currentMix = mix;
        audio.src = mix.audioUrl;
        audio.play();

        titleEl.textContent = mix.title;
        djEl.textContent = mix.dj;
        coverEl.src = mix.coverImage;
        globalPlayer?.classList.remove("hidden");
        playPauseBtn.textContent = "⏸";
    }

    /* ---------- CONTROLS ---------- */
    playPauseBtn.onclick = () => {
        if (audio.paused) {
            audio.play();
            playPauseBtn.textContent = "⏸";
        } else {
            audio.pause();
            playPauseBtn.textContent = "▶";
        }
    };

    audio.ontimeupdate = () => {
        progressBar.value = (audio.currentTime / audio.duration) * 100 || 0;
        currentTimeEl.textContent = formatTime(audio.currentTime);
        durationEl.textContent = formatTime(audio.duration);
    };

    progressBar.oninput = () => {
        audio.currentTime = (progressBar.value / 100) * audio.duration;
    };

    if (searchInput) {
        searchInput.addEventListener("input", () => {
            const q = searchInput.value.toLowerCase();
            renderDjMixes(
                allMixes.filter(
                    m =>
                        m.title.toLowerCase().includes(q) ||
                        m.dj.toLowerCase().includes(q)
                )
            );
        });
    }

    /* ---------- AI ---------- */
    function renderAI() {
        if (!aiBox) return;
        aiBox.innerHTML = "";
        allMixes.slice(0, 3).forEach(mix => {
            aiBox.innerHTML += `<p>${mix.title} — ${mix.dj}</p>`;
        });
    }

    /* ---------- WAVEFORM ---------- */
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
}

/* ================= SERVICE WORKER ================= */
function initServiceWorker() {
    if ("serviceWorker" in navigator) {
        navigator.serviceWorker.register("/service-worker.js");
    }
}
