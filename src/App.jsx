import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "../structural/Home.jsx";
import About from "../structural/About.jsx";
import Work from "../structural/Work.jsx";
import Photography from "../structural/Photography.jsx";
import Contact from "../structural/Contact.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/work" element={<Work />} />
        <Route path="/photography" element={<Photography />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
    </BrowserRouter>
  );
}