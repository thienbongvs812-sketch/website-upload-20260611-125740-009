(function () {
    const menuButton = document.querySelector("[data-menu-button]");
    const menu = document.querySelector("[data-mobile-menu]");

    if (menuButton && menu) {
        menuButton.addEventListener("click", function () {
            menu.classList.toggle("is-open");
        });
    }

    const hero = document.querySelector("[data-hero]");

    if (hero) {
        const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
        const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
        const prev = hero.querySelector("[data-hero-prev]");
        const next = hero.querySelector("[data-hero-next]");
        let current = 0;
        let timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        function advance(step) {
            show(current + step);
        }

        function play() {
            timer = window.setInterval(function () {
                advance(1);
            }, 5200);
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            play();
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                restart();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                advance(-1);
                restart();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                advance(1);
                restart();
            });
        }

        show(0);
        play();
    }

    const searchInputs = Array.from(document.querySelectorAll("[data-search-input]"));

    searchInputs.forEach(function (input) {
        const section = input.closest("main") || document;
        const chips = Array.from(section.querySelectorAll("[data-filter-value]"));
        let filter = "";

        function normalize(value) {
            return String(value || "").toLowerCase().trim();
        }

        function apply() {
            const query = normalize(input.value);
            const activeFilter = normalize(filter);
            const cards = Array.from(section.querySelectorAll(".movie-card"));

            cards.forEach(function (card) {
                const text = normalize([
                    card.getAttribute("data-title"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-genre"),
                    card.getAttribute("data-tags")
                ].join(" "));
                const matchedQuery = !query || text.indexOf(query) !== -1;
                const matchedFilter = !activeFilter || text.indexOf(activeFilter) !== -1;
                card.classList.toggle("is-hidden-by-search", !(matchedQuery && matchedFilter));
            });
        }

        input.addEventListener("input", apply);

        chips.forEach(function (chip) {
            chip.addEventListener("click", function () {
                chips.forEach(function (item) {
                    item.classList.remove("is-active");
                });
                chip.classList.add("is-active");
                filter = chip.getAttribute("data-filter-value") || "";
                apply();
            });
        });
    });
})();
