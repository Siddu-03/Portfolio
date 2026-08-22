import { useEffect, useMemo, useRef, useState } from "react";
import workData from "../data/work.json";
import "../design/Work.css";

/*
  Work.jsx — 03 — BUILD
  Renders the project constellation and (if present) the experience archive.
  All content is sourced from data/work.json. Nothing here is hardcoded.
*/

// Deterministic pseudo-random layout generator so the constellation
// looks organic but never shuffles between renders.
function seededPosition(index, total) {
  const seed = (index * 137.508) % 360; // golden-angle style distribution
  const angleRad = (seed * Math.PI) / 180;

  // Spread across a wide asymmetric field rather than a grid.
  const baseX = 50 + Math.cos(angleRad) * (28 + (index % 3) * 9);
  const baseY = (index / Math.max(total - 1, 1)) * 78 + 8;
  const jitterX = ((index * 53) % 13) - 6;
  const jitterY = ((index * 29) % 9) - 4;

  const scale = [1, 0.82, 1.12, 0.9, 1, 0.86][index % 6];

  return {
    left: Math.min(86, Math.max(6, baseX + jitterX)),
    top: Math.min(92, Math.max(4, baseY + jitterY)),
    scale,
  };
}

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = (e) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return reduced;
}

function ProjectObject({ project, index, position, revealed, reducedMotion }) {
  const ref = useRef(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });
  const [active, setActive] = useState(false);

  const handlePointerMove = (e) => {
    if (reducedMotion || e.pointerType === "touch") return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    const MAX_TILT = 6; // restrained, physical, never dramatic
    setTilt({ rx: -py * MAX_TILT, ry: px * MAX_TILT });
  };

  const resetTilt = () => setTilt({ rx: 0, ry: 0 });

  const handleActivate = () => {
    window.location.assign(`/work/${project.id}`);
  };

  const style = {
    left: `${position.left}%`,
    top: `${position.top}%`,
    "--scale": position.scale,
    "--rx": `${tilt.rx}deg`,
    "--ry": `${tilt.ry}deg`,
    "--reveal-delay": `${index * 90}ms`,
  };

  return (
    <a
      href={`/work/${project.id}`}
      ref={ref}
      className={`work-project ${revealed ? "is-revealed" : ""} ${active ? "is-active" : ""}`}
      style={style}
      onPointerMove={handlePointerMove}
      onPointerLeave={() => {
        resetTilt();
        setActive(false);
      }}
      onPointerEnter={() => setActive(true)}
      onFocus={() => setActive(true)}
      onBlur={() => {
        setActive(false);
        resetTilt();
      }}
      onClick={(e) => {
        e.preventDefault();
        handleActivate();
      }}
      aria-label={`${project.title}${project.shortDescription ? " — " + project.shortDescription : ""}`}
    >
      <span className="work-project__index">{String(index + 1).padStart(2, "0")}</span>
      <span className="work-project__title">{project.title}</span>
      {project.shortDescription && (
        <span className="work-project__desc">{project.shortDescription}</span>
      )}
    </a>
  );
}

function ExperienceEntry({ entry }) {
  return (
    <div className="work-experience__entry" tabIndex={0}>
      <span className="work-experience__role">{entry.role}</span>
      <div className="work-experience__details">
        {entry.organization && <span className="work-experience__org">{entry.organization}</span>}
        {entry.period && <span className="work-experience__period">{entry.period}</span>}
        {entry.description && <p className="work-experience__desc">{entry.description}</p>}
        {Array.isArray(entry.responsibilities) && entry.responsibilities.length > 0 && (
          <ul className="work-experience__resp">
            {entry.responsibilities.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default function Work() {
  const projects = Array.isArray(workData?.projects) ? workData.projects : [];
  const experience = Array.isArray(workData?.experience) ? workData.experience : [];
  const reducedMotion = useReducedMotion();

  const [revealed, setRevealed] = useState(reducedMotion);
  const sectionRef = useRef(null);

  const positions = useMemo(
    () => projects.map((_, i) => seededPosition(i, projects.length)),
    [projects.length]
  );

  useEffect(() => {
    if (reducedMotion) {
      setRevealed(true);
      return;
    }
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [reducedMotion]);

  return (
    <main className="work-page" ref={sectionRef}>
      <header className="work-chapter">
        <span className="work-chapter__index">03</span>
        <h1 className="work-chapter__title">BUILD</h1>
      </header>

      <section className="work-constellation" aria-label="Selected projects">
        {/* Subtle connective structure behind the projects */}
        <svg className="work-constellation__lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          {positions.slice(1).map((pos, i) => {
            const prev = positions[i];
            return (
              <line
                key={i}
                x1={prev.left}
                y1={prev.top}
                x2={pos.left}
                y2={pos.top}
                className="work-constellation__line"
              />
            );
          })}
        </svg>

        {projects.length === 0 ? (
          <p className="work-empty">No projects found in work.json.</p>
        ) : (
          projects.map((project, i) => (
            <ProjectObject
              key={project.id ?? i}
              project={project}
              index={i}
              position={positions[i]}
              revealed={revealed}
              reducedMotion={reducedMotion}
            />
          ))
        )}
      </section>

      {experience.length > 0 && (
        <section className="work-experience" aria-label="Experience">
          <span className="work-experience__label">Experience</span>
          <div className="work-experience__list">
            {experience.map((entry) => (
              <ExperienceEntry key={entry.id ?? entry.role} entry={entry} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}