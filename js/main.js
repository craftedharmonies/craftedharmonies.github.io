// ============================================================
//  Галерея: чтобы добавить фото, положите файл в папку photos/
//  и добавьте его имя в список ниже (одна строка на фото):
// ============================================================
const GALLERY = [
    "photos/photo_9_2026-10-19_13-08-35.jpg",
    "photos/work-01.jpg",
    "photos/work-02.jpg",
    "photos/work-03.jpg",
    "photos/work-04.jpg",
    "photos/work-05.jpg",
    "photos/work-06.jpg",
    "photos/work-07.jpg",
    "photos/work-08.jpg",
    "photos/work-09.jpg",
    "photos/work-10.jpg",
    "photos/work-11.jpg",
    "photos/work-12.jpg",
    "photos/work-13.jpg",
    "photos/work-14.jpg",
    "photos/work-15.jpg",
    "photos/work-16.jpg",
    "photos/work-17.jpg",
    "photos/work-18.jpg",
    "photos/work-19.jpg",
    "photos/work-20.jpg",
    "photos/work-21.jpg",
    "photos/work-22.jpg"
];

// Сколько фото показывать до стрелочки «показать все»
const GALLERY_PREVIEW_LIMIT = 6;
const GALLERY_GAP = 22;

(function () {
    "use strict";

    const grid = document.getElementById("galleryGrid");
    const moreBox = document.getElementById("galleryMore");
    const moreBtn = document.getElementById("galleryMoreBtn");
    const lightbox = document.getElementById("lightbox");
    const lbImg = document.getElementById("lbImg");
    const lbCap = document.getElementById("lbCaption");
    let current = 0;

    // ---------- появление блоков при скролле ----------
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let io = null;

    if (!reduced && "IntersectionObserver" in window) {
        io = new IntersectionObserver(function (entries) {
            entries.forEach(function (en) {
                if (!en.isIntersecting) return;
                const el = en.target;
                el.style.transitionDelay = (el.dataset.delay || 0) + "ms";
                el.classList.add("in");
                io.unobserve(el);
            });
        }, { threshold: 0.12 });
        document.querySelectorAll(".reveal").forEach(function (el) { io.observe(el); });
    } else {
        document.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("in"); });
    }

    function reveal(el) {
        if (io) io.observe(el);
        else el.classList.add("in");
    }

    // ---------- галерея (JS-masonry: фото не «переезжают» при раскрытии) ----------
    const visible = []; // элементы галереи в порядке GALLERY
    let colEls = [];    // колонки галереи

    function colCount() {
        const w = window.innerWidth;
        return w <= 600 ? 1 : (w <= 980 ? 2 : 3);
    }

    function ensureCols() {
        const n = colCount();
        while (colEls.length > n) colEls.pop().remove();
        while (colEls.length < n) {
            const c = document.createElement("div");
            c.className = "gallery-col";
            grid.appendChild(c);
            colEls.push(c);
        }
    }

    function itemHeight(el) {
        if (el.offsetHeight) return el.offsetHeight;
        const img = el.querySelector("img");
        const n = colCount();
        const colW = (grid.clientWidth - GALLERY_GAP * (n - 1)) / n;
        const ratio = (img && img.naturalWidth) ? img.naturalHeight / img.naturalWidth : 1.25;
        return colW * ratio + 30;
    }

    function layout() {
        ensureCols();
        colEls.forEach(function (c) { c.textContent = ""; });
        const h = colEls.map(function () { return 0; });
        visible.forEach(function (el) {
            const hh = itemHeight(el) + GALLERY_GAP;
            let k = 0;
            for (let j = 1; j < h.length; j++) if (h[j] < h[k]) k = j;
            colEls[k].appendChild(el);
            h[k] += hh;
        });
    }

    function makeItem(src, i) {
        const fig = document.createElement("figure");
        fig.className = "g-item reveal";
        fig.dataset.delay = String((i % 3) * 90);

        const frame = document.createElement("div");
        frame.className = "g-frame";

        const img = document.createElement("img");
        img.src = src;
        img.alt = "Фото работы " + (i + 1);
        img.loading = "lazy";
        img.addEventListener("load", layout);
        frame.appendChild(img);

        fig.appendChild(frame);
        fig.addEventListener("click", function () { openLb(galleryItems, i); });
        return fig;
    }

    // первые GALLERY_PREVIEW_LIMIT фото
    for (let i = 0; i < GALLERY_PREVIEW_LIMIT; i++) {
        const el = makeItem(GALLERY[i], i);
        visible.push(el);
        grid.appendChild(el);
    }
    layout();
    visible.forEach(reveal);

    // стрелочка: вниз — показать все фото ниже, вверх — скрыть до первых двух рядов
    if (GALLERY.length > GALLERY_PREVIEW_LIMIT) {
        moreBox.hidden = false;
        let expanded = false;
        moreBtn.addEventListener("click", function () {
            expanded = !expanded;
            if (expanded) {
                for (let i = GALLERY_PREVIEW_LIMIT; i < GALLERY.length; i++) {
                    const el = makeItem(GALLERY[i], i);
                    visible.push(el);
                    grid.appendChild(el);
                }
                layout();
                visible.slice(GALLERY_PREVIEW_LIMIT).forEach(reveal);
            } else {
                while (visible.length > GALLERY_PREVIEW_LIMIT) {
                    visible.pop().remove();
                }
                layout();
            }
            moreBtn.classList.toggle("expanded", expanded);
            moreBtn.setAttribute("aria-expanded", String(expanded));
            moreBtn.setAttribute("aria-label", expanded ? "Скрыть часть фото" : "Показать все фото");
        });
    }

    let resizeTimer = null;
    window.addEventListener("resize", function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(layout, 150);
    });

    // ---------- лайтбокс ----------
    let lbItems = [];

    const galleryItems = GALLERY.map(function (src, idx) {
        return { src: src, alt: "Фото работы " + (idx + 1) };
    });

    function update() {
        const it = lbItems[current];
        lbImg.src = it.src;
        lbImg.alt = it.alt;
        lbCap.textContent = (current + 1) + " / " + lbItems.length;
    }

    function openLb(items, i) {
        lbItems = items;
        current = i;
        update();
        lightbox.classList.add("open");
        document.body.style.overflow = "hidden";
    }

    function closeLb() {
        lightbox.classList.remove("open");
        document.body.style.overflow = "";
    }

    function step(d) {
        current = (current + d + lbItems.length) % lbItems.length;
        update();
    }

    document.getElementById("lbClose").addEventListener("click", closeLb);
    document.getElementById("lbPrev").addEventListener("click", function (e) {
        e.stopPropagation();
        step(-1);
    });
    document.getElementById("lbNext").addEventListener("click", function (e) {
        e.stopPropagation();
        step(1);
    });
    lightbox.addEventListener("click", function (e) {
        if (e.target === lightbox) closeLb();
    });
    document.addEventListener("keydown", function (e) {
        if (!lightbox.classList.contains("open")) return;
        if (e.key === "Escape") closeLb();
        if (e.key === "ArrowLeft") step(-1);
        if (e.key === "ArrowRight") step(1);
    });

    // ---------- мобильное меню ----------
    const burger = document.getElementById("burger");
    const nav = document.getElementById("nav");

    burger.addEventListener("click", function () {
        const open = nav.classList.toggle("open");
        burger.classList.toggle("active", open);
        burger.setAttribute("aria-expanded", String(open));
    });

    nav.querySelectorAll("a").forEach(function (a) {
        a.addEventListener("click", function () {
            nav.classList.remove("open");
            burger.classList.remove("active");
            burger.setAttribute("aria-expanded", "false");
        });
    });

    // ---------- активный пункт меню ----------
    const links = Array.prototype.slice.call(document.querySelectorAll('.nav a[href^="#"]'));
    const sections = links
        .map(function (l) { return document.querySelector(l.getAttribute("href")); })
        .filter(Boolean);

    if ("IntersectionObserver" in window) {
        const spy = new IntersectionObserver(function (entries) {
            entries.forEach(function (en) {
                if (!en.isIntersecting) return;
                links.forEach(function (l) {
                    l.classList.toggle("active", l.getAttribute("href") === "#" + en.target.id);
                });
            });
        }, { rootMargin: "-40% 0px -55% 0px" });
        sections.forEach(function (s) { spy.observe(s); });
    }
})();
