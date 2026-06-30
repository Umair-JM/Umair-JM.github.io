import { securityResearch } from "../data.js";
import { Reveal } from "../lib/motion.jsx";
import Footer from "../components/Footer.jsx";

export default function Research() {
  return (
    <>
      <div className="subhead">
        <Reveal as="div" className="label">Applied research</Reveal>
        <Reveal as="h1" delay={0.05}>Security research</Reveal>
        <Reveal as="p" delay={0.1}>
          A selection of my security focused work, from my time at NUST's COGNET Lab and ongoing
          collaborations. The themes are zero-trust network design, secure communication for
          cyber-physical systems, cryptography and adversarial machine learning. My name is in bold.
        </Reveal>
      </div>

      <ol className="pub-list">
        {securityResearch.map((p, i) => (
          <Reveal as="li" className="pub-item" key={i} delay={i * 0.05}>
            <p className="pub-cite" dangerouslySetInnerHTML={{ __html: p.cite.replace("Manj, U. J.", "<strong>Manj, U. J.</strong>") }} />
            <p className="pub-venue">{p.venue}</p>
            <span className="pub-badge">{p.status}</span>
          </Reveal>
        ))}
      </ol>

      <Reveal as="p" className="hero-body" delay={0.1}>
        Earlier work at COGNET Lab covered quantum resistant cryptography, defences against
        adversarial attacks on deep learning models, and a verifiable, tamper evident voting system
        built with computer vision and cryptography.
      </Reveal>

      <Footer />
    </>
  );
}
