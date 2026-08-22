import { useEffect, useRef, useState } from "react";
import personal from "../data/personal.json";
import "../design/Contact.css";

/*
  05 — CONNECT
  The closing scene. Quiet, asymmetric, mostly still.

  Data access is defensive: personal.json's exact contact/social shape
  isn't fixed yet, so we read a handful of plausible paths rather than
  assuming one. Nothing here is hardcoded — if a value is missing, the
  corresponding UI (a social link, the mailto fallback) simply omits it.
*/

function readPath(obj, path) {
  return path.split(".").reduce((acc, key) => (acc == null ? undefined : acc[key]), obj);
}

function firstDefined(obj, paths) {
  for (const path of paths) {
    const value = readPath(obj, path);
    if (value) return value;
  }
  return undefined;
}

const SOCIAL_PLATFORMS = [
  { key: "github", label: "GitHub", paths: ["contact.social.github", "social.github", "github"] },
  { key: "linkedin", label: "LinkedIn", paths: ["contact.social.linkedin", "social.linkedin", "linkedin"] },
  { key: "instagram", label: "Instagram", paths: ["contact.social.instagram", "social.instagram", "instagram"] },
];

const EMAIL_PATHS = ["contact.email", "email"];
const NAME_PATHS = ["name", "displayName"];

export default function Contact() {
  const email = firstDefined(personal, EMAIL_PATHS);
  const name = firstDefined(personal, NAME_PATHS) || "Siddeshwarprasad K R";

  const socials = SOCIAL_PLATFORMS.map((platform) => ({
    ...platform,
    url: firstDefined(personal, platform.paths),
  })).filter((platform) => platform.url);

  const chapterRef = useRef(null);
  const sceneRef = useRef(null);
  const [chapterVisible, setChapterVisible] = useState(false);
  const [sceneVisible, setSceneVisible] = useState(false);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-motion: reduce)").matches
      || window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      setChapterVisible(true);
      setSceneVisible(true);
      return;
    }

    const chapterObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setChapterVisible(true);
          chapterObserver.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    const sceneObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSceneVisible(true);
          sceneObserver.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    if (chapterRef.current) chapterObserver.observe(chapterRef.current);
    if (sceneRef.current) sceneObserver.observe(sceneRef.current);

    return () => {
      chapterObserver.disconnect();
      sceneObserver.disconnect();
    };
  }, []);

  const [formState, setFormState] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error

  function handleChange(event) {
    const { name: field, value } = event.target;
    setFormState((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!formState.name.trim() || !formState.email.trim() || !formState.message.trim()) {
      setStatus("error");
      return;
    }

    // No submission service is configured for this project yet.
    // Rather than faking a delivered message, this opens the visitor's
    // own mail client with the message pre-filled — a real, working
    // path that doesn't require a backend or expose the address in the UI.
    // Replace this block with a fetch() to a real endpoint once one exists.
    if (email) {
      setStatus("sending");
      const subject = formState.subject.trim() || `Message from ${formState.name.trim()}`;
      const body = `${formState.message.trim()}\n\n—\n${formState.name.trim()}\n${formState.email.trim()}`;
      const mailto = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.location.href = mailto;
      setStatus("sent");
    } else {
      setStatus("error");
    }
  }

  return (
    <main className="contact-page" aria-label={`Contact ${name}`}>
      <div
        ref={chapterRef}
        className={`contact-chapter ${chapterVisible ? "is-visible" : ""}`}
        aria-hidden="true"
      >
        <span className="contact-chapter__mark">05</span>
        <span className="contact-chapter__title">CONNECT</span>
      </div>

      <div ref={sceneRef} className={`contact-scene ${sceneVisible ? "is-visible" : ""}`}>
        <section className="contact-statement">
          <h1 className="contact-statement__text">
            LET&rsquo;S BUILD
            <br />
            SOMETHING.
          </h1>
        </section>

        <section className="contact-form-section" aria-labelledby="contact-form-heading">
          <h2 id="contact-form-heading" className="contact-form-section__label">
            Message
          </h2>

          <form className="contact-form" onSubmit={handleSubmit} noValidate>
            <div className="contact-field">
              <label htmlFor="contact-name">Name</label>
              <input
                id="contact-name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={formState.name}
                onChange={handleChange}
              />
            </div>

            <div className="contact-field">
              <label htmlFor="contact-email">Email</label>
              <input
                id="contact-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formState.email}
                onChange={handleChange}
              />
            </div>

            <div className="contact-field">
              <label htmlFor="contact-subject">
                Subject <span className="contact-field__optional">(optional)</span>
              </label>
              <input
                id="contact-subject"
                name="subject"
                type="text"
                value={formState.subject}
                onChange={handleChange}
              />
            </div>

            <div className="contact-field">
              <label htmlFor="contact-message">Message</label>
              <textarea
                id="contact-message"
                name="message"
                rows={4}
                required
                value={formState.message}
                onChange={handleChange}
              />
            </div>

            <div className="contact-form__footer">
              <button type="submit" className="contact-submit">
                <span>Send message</span>
                <span className="contact-submit__arrow" aria-hidden="true">
                  ↗
                </span>
              </button>

              <p className="contact-form__status" role="status" aria-live="polite">
                {status === "sending" && "Opening your email client…"}
                {status === "sent" && "Your email client should now be open."}
                {status === "error" && "Please fill in your name, email and message."}
              </p>
            </div>
          </form>
        </section>

        {socials.length > 0 && (
          <nav className="contact-socials" aria-label="Social profiles">
            <ul>
              {socials.map((platform) => (
                <li key={platform.key}>
                  <a href={platform.url} target="_blank" rel="noreferrer noopener">
                    <span>{platform.label}</span>
                    <span className="contact-socials__arrow" aria-hidden="true">
                      ↗
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
    </main>
  );
}