import { useEffect, useRef, useState } from "react";

/**
 * About.jsx — 02 — DISCOVER
 *
 * Page-owned component. No shared components, hooks, or utilities.
 * All content is sourced from data/personal.json via fetch("/data/personal.json").
 *
 * Expected personal.json shape consumed here (see report for full detail):
 *
 * {
 *   "name": "Siddeshwarprasad K R",
 *   "about": {
 *     "images": [ { "src": "/assets/about/about-01.jpg", "alt": "..." }, ... ],
 *     "secondaryImage": { "src": "/assets/about/about-03.jpg", "alt": "..." },
 *     "intro": "short editorial intro paragraph",
 *     "story": {
 *       "cybersecurity": "origin story paragraph",
 *       "physics": "physics / mathematics paragraph",
 *       "college": "college / personal growth paragraph"
 *     },
 *     "values": ["short statement", "short statement", ...],
 *     "philosophy": "You can be anything you want in life but not everything.",
 *     "interestGroups": [ { "group": "Cybersecurity & Building", "items": ["Cybersecurity","Web Development","AI/ML"], "note": "..." }, ... ],
 *     "timeline": [ { "label": "Discovering cybersecurity", "year": "", "description": "..." }, ... ]
 *   }
 * }
 */

const FALLBACK = {
  name: "Siddeshwarprasad K R",
  about: {
    images: [
      { src: "/assets/about/about-01.jpg", alt: "Siddeshwarprasad, personal photograph" },
      { src: "/assets/about/about-02.jpg", alt: "Siddeshwarprasad, personal photograph" },
    ],
    secondaryImage: {
      src: "/assets/about/about-03.jpg",
      alt: "Siddeshwarprasad, personal photograph",
    },
    intro:
      "Away from the projects and the case studies, there's a fairly simple person — one who got curious about the right thing at the right time, and has been following that curiosity since.",
    story: {
      cybersecurity:
        "It started with a story about Anonymous — a government website, and a quiet act of protecting sea turtle nesting sites. It wasn't the technical details that stayed with him. It was the realization that technology, used carefully, could actually make a difference in the world. That idea hasn't left since.",
      physics:
        "Somewhere along the way, he found he was good at theoretical physics and mathematics — the kind of thinking that likes patterns, proofs, and problems that don't give up their answers easily. Cybersecurity felt like the natural continuation of that same instinct.",
      college:
        "College turned out to be less about lectures and more about people. It's where the real world, and real feelings, started to matter as much as the material.",
    },
    values: [
      "Tech should help us, not replace us.",
      "Design should make things look better, not make them complex.",
      "Building should be consistent work.",
    ],
    philosophy: "You can be anything you want in life but not everything.",
    interestGroups: [
      {
        group: "Security & Building",
        items: ["Cybersecurity", "Web Development", "AI/ML"],
        note: "Where curiosity meets making things.",
      },
      {
        group: "Seeing & Making",
        items: ["Photography", "Design"],
        note: "A different way of paying attention.",
      },
      {
        group: "Thinking",
        items: ["Physics", "Space", "History"],
        note: "Questions worth sitting with.",
      },
      {
        group: "Living",
        items: ["Cinema", "Books", "Marvel", "Music", "Guitar", "Travel"],
        note: "Everything else that keeps things human.",
      },
    ],
    timeline: [
      {
        label: "Discovering cybersecurity",
        year: "",
        description: "A story about Anonymous, a government site, and sea turtles.",
      },
      {
        label: "Finding a pull toward physics",
        year: "",
        description: "Noticing he was drawn to theoretical thinking and mathematics.",
      },
      {
        label: "Choosing the field",
        year: "",
        description: "Cybersecurity, because it felt like the same kind of thinking.",
      },
      {
        label: "Entering university",
        year: "",
        description: "The start of studying it properly.",
      },
      {
        label: "Meeting the real world",
        year: "",
        description: "College — people, feelings, independence.",
      },
      {
        label: "Right now",
        year: "",
        description: "Still building, still curious, still figuring out the shape of it.",
      },
    ],
  },
};

function useReveal(threshold = 0.2) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced) {
      setVisible(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold]);

  return [ref, visible];
}

function Reveal({ as: Tag = "div", className = "", children, threshold }) {
  const [ref, visible] = useReveal(threshold);
  return (
    <Tag ref={ref} className={`about-reveal ${visible ? "is-visible" : ""} ${className}`}>
      {children}
    </Tag>
  );
}

export default function About() {
  const [data, setData] = useState(FALLBACK);
  const [missingFields, setMissingFields] = useState([]);

  useEffect(() => {
    let cancelled = false;

    fetch("/data/personal.json")
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("not found"))))
      .then((json) => {
        if (cancelled) return;

        const about = json.about || {};
        const missing = [];

        if (!about.images || about.images.length === 0) missing.push("about.images");
        if (!about.secondaryImage) missing.push("about.secondaryImage");
        if (!about.intro) missing.push("about.intro");
        if (!about.story || !about.story.cybersecurity) missing.push("about.story.cybersecurity");
        if (!about.story || !about.story.physics) missing.push("about.story.physics");
        if (!about.story || !about.story.college) missing.push("about.story.college");
        if (!about.values || about.values.length === 0) missing.push("about.values");
        if (!about.philosophy) missing.push("about.philosophy");
        if (!about.interestGroups || about.interestGroups.length === 0)
          missing.push("about.interestGroups");
        if (!about.timeline || about.timeline.length === 0) missing.push("about.timeline");

        setMissingFields(missing);
        setData({
          name: json.name || FALLBACK.name,
          about: {
            images: about.images && about.images.length ? about.images : FALLBACK.about.images,
            secondaryImage: about.secondaryImage || FALLBACK.about.secondaryImage,
            intro: about.intro || FALLBACK.about.intro,
            story: {
              cybersecurity:
                (about.story && about.story.cybersecurity) || FALLBACK.about.story.cybersecurity,
              physics: (about.story && about.story.physics) || FALLBACK.about.story.physics,
              college: (about.story && about.story.college) || FALLBACK.about.story.college,
            },
            values: about.values && about.values.length ? about.values : FALLBACK.about.values,
            philosophy: about.philosophy || FALLBACK.about.philosophy,
            interestGroups:
              about.interestGroups && about.interestGroups.length
                ? about.interestGroups
                : FALLBACK.about.interestGroups,
            timeline:
              about.timeline && about.timeline.length ? about.timeline : FALLBACK.about.timeline,
          },
        });
      })
      .catch(() => {
        if (!cancelled) setMissingFields(["data/personal.json (file not found or unreadable)"]);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const { about } = data;
  const [portraitOne, portraitTwo] = about.images;

  return (
    <main className="about-page" id="about">
      {process.env.NODE_ENV !== "production" && missingFields.length > 0 && (
        <div className="about-dev-note" role="note">
          Missing from personal.json: {missingFields.join(", ")}
        </div>
      )}

      {/* Chapter marker */}
      <Reveal as="section" className="about-chapter" threshold={0.4}>
        <span className="about-chapter__index">02</span>
        <span className="about-chapter__title">DISCOVER</span>
      </Reveal>

      {/* Opening: portrait + short intro */}
      <section className="about-opening">
        <Reveal as="figure" className="about-portrait about-portrait--one">
          <img src={portraitOne.src} alt={portraitOne.alt} loading="lazy" />
        </Reveal>

        <Reveal as="div" className="about-intro" threshold={0.3}>
          <p className="about-eyebrow">Who is he</p>
          <p className="about-intro__text">{about.intro}</p>
        </Reveal>

        {portraitTwo && (
          <Reveal as="figure" className="about-portrait about-portrait--two">
            <img src={portraitTwo.src} alt={portraitTwo.alt} loading="lazy" />
          </Reveal>
        )}
      </section>

      {/* Fragment: cybersecurity origin */}
      <section className="about-fragment about-fragment--left">
        <Reveal as="div" className="about-fragment__marker">
          <span>01</span>
        </Reveal>
        <Reveal as="div" className="about-fragment__body" threshold={0.25}>
          <h2 className="about-fragment__heading">A story about seals</h2>
          <p className="about-fragment__text">{about.story.cybersecurity}</p>
        </Reveal>
      </section>

      {/* Secondary portrait — visual pause */}
      <Reveal as="figure" className="about-portrait about-portrait--secondary" threshold={0.2}>
        <img src={about.secondaryImage.src} alt={about.secondaryImage.alt} loading="lazy" />
      </Reveal>

      {/* Fragment: physics */}
      <section className="about-fragment about-fragment--right">
        <Reveal as="div" className="about-fragment__marker">
          <span>02</span>
        </Reveal>
        <Reveal as="div" className="about-fragment__body" threshold={0.25}>
          <h2 className="about-fragment__heading">A pull toward patterns</h2>
          <p className="about-fragment__text">{about.story.physics}</p>
        </Reveal>
      </section>

      {/* Fragment: college */}
      <section className="about-fragment about-fragment--left">
        <Reveal as="div" className="about-fragment__marker">
          <span>03</span>
        </Reveal>
        <Reveal as="div" className="about-fragment__body" threshold={0.25}>
          <h2 className="about-fragment__heading">Where the real world started</h2>
          <p className="about-fragment__text">{about.story.college}</p>
        </Reveal>
      </section>

      {/* Values */}
      <section className="about-values">
        <Reveal as="p" className="about-eyebrow" threshold={0.4}>
          How he works
        </Reveal>
        <ul className="about-values__list">
          {about.values.map((value, i) => (
            <Reveal as="li" className="about-values__item" key={value} threshold={0.3}>
              <span
                className="about-values__index"
                style={{ transitionDelay: `${i * 80}ms` }}
                aria-hidden="true"
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="about-values__text">{value}</span>
            </Reveal>
          ))}
        </ul>
      </section>

      {/* Philosophy — large statement, restrained */}
      <Reveal as="section" className="about-philosophy" threshold={0.5}>
        <p className="about-philosophy__text">{about.philosophy}</p>
      </Reveal>

      {/* Interests */}
      <section className="about-interests">
        <Reveal as="p" className="about-eyebrow" threshold={0.4}>
          What he's curious about
        </Reveal>
        <div className="about-interests__field">
          {about.interestGroups.map((group, i) => (
            <Reveal
              as="div"
              className={`about-interests__group about-interests__group--${(i % 4) + 1}`}
              key={group.group}
              threshold={0.2}
            >
              <h3 className="about-interests__group-title">{group.group}</h3>
              <p className="about-interests__items">{group.items.join(" · ")}</p>
              {group.note && <p className="about-interests__note">{group.note}</p>}
            </Reveal>
          ))}
        </div>
      </section>

      {/* Timeline */}
      <section className="about-timeline">
        <Reveal as="p" className="about-eyebrow" threshold={0.4}>
          The path so far
        </Reveal>
        <ol className="about-timeline__list">
          {about.timeline.map((point, i) => (
            <Reveal
              as="li"
              className={`about-timeline__item ${i % 2 === 0 ? "is-left" : "is-right"}`}
              key={point.label}
              threshold={0.25}
            >
              {point.year && <span className="about-timeline__year">{point.year}</span>}
              <span className="about-timeline__label">{point.label}</span>
              <span className="about-timeline__description">{point.description}</span>
            </Reveal>
          ))}
        </ol>
      </section>

      {/* Quiet ending — transition toward 03 — BUILD */}
      <Reveal as="section" className="about-ending" threshold={0.5}>
        <p className="about-ending__text">That's the person. What follows is what he builds.</p>
      </Reveal>
    </main>
  );
}