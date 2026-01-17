/* ===============================
   DUNDAA CORE UI SCRIPT
   =============================== */

document.addEventListener("DOMContentLoaded", () => {
    initNavigation();
    initTicketButtons();
    initEventCards();
    initForms();
    initSmoothScroll();
});

// To access Dundaa UI version
/* ===============================
   NAVIGATION (MOBILE READY)
   =============================== */
function initNavigation() {
    const nav = document.querySelector(".main-nav");

    // Create hamburger for mobile
    const burger = document.createElement("button");
    burger.className = "nav-toggle";
    burger.innerHTML = "☰";
    burger.setAttribute("aria-label", "Toggle navigation");

    document.querySelector(".site-header")?.appendChild(burger);

    burger.addEventListener("click", () => {
        nav.classList.toggle("nav-open");
    });

    // Close nav on link click (mobile)
    nav.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", () => {
            nav.classList.remove("nav-open");
        });
    });
}

/* ===============================
   TICKET BUTTON UX
   =============================== */
function initTicketButtons() {
    const buyButtons = document.querySelectorAll(".buy-btn");

    buyButtons.forEach(btn => {
        btn.addEventListener("click", e => {
            e.preventDefault();

            btn.textContent = "Processing...";
            btn.style.opacity = "0.7";

            // Simulated loading (replace with real checkout later)
            setTimeout(() => {
                window.location.href = btn.getAttribute("href");
            }, 600);
        });
    });
}

/* ===============================
   EVENT CARD INTERACTION
   =============================== */
function initEventCards() {
    const cards = document.querySelectorAll(".event-card");

    cards.forEach(card => {
        card.addEventListener("mouseenter", () => {
            card.classList.add("active");
        });

        card.addEventListener("mouseleave", () => {
            card.classList.remove("active");
        });

        // Click anywhere on card
        card.addEventListener("click", e => {
            const btn = card.querySelector(".buy-btn");
            if (btn && !e.target.classList.contains("buy-btn")) {
                btn.click();
            }
        });
    });
}

/* ===============================
   FORMS (UX IMPROVEMENTS)
   =============================== */
function initForms() {
    document.querySelectorAll("form").forEach(form => {
        form.addEventListener("submit", e => {
            e.preventDefault();

            const submitBtn = form.querySelector("button, input[type='submit']");
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = "Sending...";
            }

            // Fake success (replace with backend later)
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

/* ===============================
   SMOOTH SCROLL
   =============================== */
function initSmoothScroll() {
    document.querySelectorAll("a[href^='#']").forEach(anchor => {
        anchor.addEventListener("click", e => {
            const target = document.querySelector(anchor.getAttribute("href"));
            if (!target) return;

            e.preventDefault();
            target.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        });
    });
}
