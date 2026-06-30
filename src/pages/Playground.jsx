import { certProjects } from "../data.js";
import { Reveal, SpotlightCard } from "../lib/motion.jsx";
import Footer from "../components/Footer.jsx";

export default function Playground() {
  return (
    <>
      <div className="subhead">
        <Reveal as="div" className="label">Hands-on</Reveal>
        <Reveal as="h1" delay={0.05}>Projects & labs</Reveal>
        <Reveal as="p" delay={0.1}>
          Practical labs I built while working through the SC-200 and CCNA tracks, from Sentinel
          detections to network routing and hardening.
        </Reveal>
      </div>

      <div className="lab-list">
        {certProjects.map((p, i) => (
          <Reveal key={p.title} delay={Math.min(i * 0.05, 0.2)}>
            <SpotlightCard className="lab-card">
              <div className="lab-top">
                <h3>{p.title}</h3>
                <span className="lab-cert">{p.cert}</span>
              </div>
              <p>{p.blurb}</p>
            </SpotlightCard>
          </Reveal>
        ))}
      </div>

      <Footer />
    </>
  );
}
