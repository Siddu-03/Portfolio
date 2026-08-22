import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import photographyData from "../data/photography.json";
import "../design/Photography.css";

/*
  Photography — 04 — SEE

  Core idea: "Photography is capturing things that I saw which I don't
  want to forget." The photographs carry that idea — no long text block
  is used to explain it.

  Two acts:

  ACT I — EXPERIENCING. A scroll-pinned cinematic sequence of exactly the
  first 8 photographs flagged `featured: true` in photography.json. As the
  visitor scrolls through each 100svh slide, the current photograph drifts
  away (direction driven by the photo's `movement` value) while the next
  photograph — already waiting slightly behind/smaller — grows into the
  dominant position. Only two <img> layers are ever mounted (current +
  next), keeping the DOM and network light.

  ACT II — EXPLORING. A quiet, natural-scrolling editorial wall containing
  the complete collection (all photographs, featured or not). Zero gaps
  between photographs, one equal outer border around the whole grid,
  varied cell sizes derived from each photo's `orientation`.
*/

// Deterministic exit vectors per movement key. x -> vw, y -> vh.
const MOVEMENT_VECTORS = {
  left: [-46, 0],
  right: [46, 0],
  up: [0, -46],
  down: [0, 46],
  "left-up": [-32, -32],
  "right-up": [32, -32],
  "left-down": [-32, 32],
  "right-down": [32, 32],
};

function getVector(movement) {
  return MOVEMENT_VECTORS[movement] || MOVEMENT_VECTORS.left;
}

const LAZY_AFTER_INDEX = 3; // first few gallery images load eager, rest lazy

export default function Photography() {
  const allPhotos = useMemo(() => photographyData.photography || [], []);

  // Act I: exactly the first 8 photographs flagged featured.
  const photos = useMemo(
    () => allPhotos.filter((photo) => photo.featured).slice(0, 8),
    [allPhotos]
  );

  // Act II: the complete collection (featured photos may also appear here).
  const galleryPhotos = allPhotos;

  const transitionRef = useRef(null);
  const [transitionVisible, setTransitionVisible] = useState(false);

  const stackTrackRef = useRef(null);
  const currentFrameRef = useRef(null);
  const nextFrameRef = useRef(null);
  const currentImgWrapRef = useRef(null);
  const nextImgWrapRef = useRef(null);
  const progressFillRef = useRef(null);

  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Respect prefers-reduced-motion, and keep it live if the OS setting changes.
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  // Quiet, restrained entrance for the Act I → Act II label. This is a
  // one-time fade, not part of the scroll-linked cinematic system, so a
  // simple IntersectionObserver is enough — no rAF loop required.
  useEffect(() => {
    const node = transitionRef.current;
    if (!node) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTransitionVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (photos.length === 0) return undefined;
    if (reducedMotion) return undefined; // simple CSS crossfade handles this mode

    let rafId = null;
    let ticking = false;

    const applyStyles = (progress) => {
      const eased = progress; // linear is intentional: feels physically scroll-coupled
      const current = photos[activeIndexRef.current];
      const [cx, cy] = getVector(current?.movement);

      if (currentFrameRef.current) {
        currentFrameRef.current.style.transform = `translate3d(${cx * eased}vw, ${cy * eased}vh, 0) scale(${1 - 0.12 * eased})`;
      }
      if (currentImgWrapRef.current) {
        currentImgWrapRef.current.style.opacity = String(Math.max(0, 1 - eased * 1.05));
      }

      if (nextFrameRef.current) {
        const entryX = -cx * 0.16 * (1 - eased);
        const entryY = -cy * 0.16 * (1 - eased);
        const scale = 0.55 + 0.45 * eased;
        nextFrameRef.current.style.transform = `translate3d(${entryX}vw, ${entryY}vh, 0) scale(${scale})`;
      }
      if (nextImgWrapRef.current) {
        nextImgWrapRef.current.style.opacity = String(0.3 + 0.7 * eased);
      }

      if (progressFillRef.current) {
        progressFillRef.current.style.height = `${eased * 100}%`;
      }
    };

    const measure = () => {
      ticking = false;
      const track = stackTrackRef.current;
      if (!track) return;

      const slideHeight = window.innerHeight;
      const rect = track.getBoundingClientRect();
      const scrolledIntoTrack = -rect.top;
      const total = photos.length;
      const maxScroll = slideHeight * (total - 1);
      const clamped = Math.min(Math.max(scrolledIntoTrack, 0), Math.max(maxScroll, 0));

      let idx = Math.floor(clamped / slideHeight);
      idx = Math.min(idx, total - 1);
      const progress = total > 1 ? (clamped - idx * slideHeight) / slideHeight : 0;

      if (idx !== activeIndexRef.current) {
        activeIndexRef.current = idx;
        setActiveIndex(idx);
      }
      applyStyles(Math.min(Math.max(progress, 0), 1));
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        rafId = requestAnimationFrame(measure);
      }
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [photos, reducedMotion]);

  if (photos.length === 0) {
    return (
      <main className="photography-page">
        <section className="photo-chapter">
          <p className="photo-chapter-index">04 — SEE</p>
          <h1 className="photo-chapter-title">Nothing here yet.</h1>
        </section>
      </main>
    );
  }

  const current = photos[activeIndex];
  const next = photos[Math.min(activeIndex + 1, photos.length - 1)];
  const hasNext = activeIndex < photos.length - 1;

  return (
    <main className={`photography-page${reducedMotion ? " is-reduced-motion" : ""}`}>
      <nav className="photo-nav" aria-label="Primary">
        <Link to="/" className="photo-nav-logo" aria-label="Return to Home">
          S
        </Link>
        <ul className="photo-nav-links">
          <li>
            <Link to="/about">About</Link>
          </li>
          <li>
            <Link to="/work">Work</Link>
          </li>
          <li>
            <Link to="/photography" className="is-current" aria-current="page">
              Photography
            </Link>
          </li>
          <li>
            <Link to="/contact">Contact</Link>
          </li>
        </ul>
      </nav>

      <section className="photo-chapter">
        <p className="photo-chapter-index">04 — SEE</p>
        <h1 className="photo-chapter-title">See.</h1>
        <p className="photo-chapter-sub">
          Things I saw and did not want to forget.
        </p>
      </section>

      <div
        className="photo-stack-track"
        ref={stackTrackRef}
        style={{ height: `${photos.length * 100}svh` }}
      >
        <div className="photo-stack-viewport">
          <div
            className={`photo-layer photo-layer--current photo-layer--${current.orientation || "landscape"}`}
            ref={currentFrameRef}
          >
            <div className="photo-layer-frame" ref={currentImgWrapRef}>
              <img src={current.image} alt={current.alt} loading="eager" />
            </div>
          </div>

          {hasNext && (
            <div
              className={`photo-layer photo-layer--next photo-layer--${next.orientation || "landscape"}`}
              ref={nextFrameRef}
            >
              <div className="photo-layer-frame" ref={nextImgWrapRef}>
                <img src={next.image} alt={next.alt} loading="lazy" />
              </div>
            </div>
          )}

          <div className="photo-meta">
            <span className="photo-meta-count">
              {String(activeIndex + 1).padStart(2, "0")} / {String(photos.length).padStart(2, "0")}
            </span>
            <span className="photo-meta-title">{current.title}</span>
            {current.description && (
              <span className="photo-meta-caption">{current.description}</span>
            )}
          </div>

          <div className="photo-progress" aria-hidden="true">
            <div className="photo-progress-fill" ref={progressFillRef} />
          </div>
        </div>
      </div>

      {/* Restrained transition out of the cinematic sequence. No hard cut,
          no generic "View Gallery" CTA — just a quiet label. */}
      <div
        className={`photo-act-transition${transitionVisible ? " is-visible" : ""}`}
        ref={transitionRef}
      >
        <span className="photo-act-transition-label">More to see</span>
      </div>

      {/* Act II — a quiet, naturally-scrolling editorial wall of the full
          collection. No pinning, no cinematic transitions from here on. */}
      <section className="photo-gallery-section" aria-label="Photography collection">
        <div className="photo-gallery-frame">
          <div className="photo-gallery-grid">
            {galleryPhotos.map((photo, i) => (
              <div
                key={photo.id}
                className={`photo-gallery-item photo-gallery-item--${photo.orientation || "landscape"}`}
              >
                <img
                  src={photo.image}
                  alt={photo.alt}
                  loading={i < LAZY_AFTER_INDEX ? "eager" : "lazy"}
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}