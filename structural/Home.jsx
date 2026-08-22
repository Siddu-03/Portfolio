import { Link } from "react-router-dom";
import "../design/Home.css";

function Home() {
  return (
    <div className="home-temp">
      <header className="home-temp-nav">
        <Link to="/" className="home-temp-logo" aria-label="Home">
          S
        </Link>

        <nav className="home-temp-links" aria-label="Primary navigation">
          <Link to="/about">About</Link>
          <Link to="/work">Work</Link>
          <Link to="/photography">Photography</Link>
          <Link to="/contact">Contact</Link>
        </nav>
      </header>

      <main className="home-temp-main">
        <h1 className="home-temp-name">Siddeshwarprasad K R</h1>
        <p className="home-temp-note">Portfolio — currently under construction.</p>

        <nav className="home-temp-main-links" aria-label="Page navigation">
          <Link to="/about">About</Link>
          <Link to="/work">Work</Link>
          <Link to="/photography">Photography</Link>
          <Link to="/contact">Contact</Link>
        </nav>
      </main>
    </div>
  );
}

export default Home;