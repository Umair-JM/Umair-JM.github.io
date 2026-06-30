import { certsInProgress, certsCompleted } from "../data.js";
import { Reveal, Stagger, StaggerItem, SpotlightCard } from "../lib/motion.jsx";
import Footer from "../components/Footer.jsx";

export default function Certifications() {
  return (
    <>
      <div className="subhead">
        <Reveal as="div" className="label">Credentials</Reveal>
        <Reveal as="h1" delay={0.05}>Certifications</Reveal>
        <Reveal as="p" delay={0.1}>
          More than 20 completed certifications across IBM, Cisco, TryHackMe and Coursera, spanning
          security operations, penetration testing, threat intelligence, incident response and
          network defense. Three more are in progress.
        </Reveal>
      </div>

      <h2 className="group-title">In progress</h2>
      <Stagger className="masonry" gap={0.05}>
        {certsInProgress.map((c) => (
          <StaggerItem className="cert-card" key={c.name}>
            <SpotlightCard>
              <span className="issuer">{c.issuer} · in progress</span>
              <h3>{c.name}</h3>
            </SpotlightCard>
          </StaggerItem>
        ))}
      </Stagger>

      <h2 className="group-title">Completed</h2>
      <Stagger className="masonry" gap={0.03}>
        {certsCompleted.map((c) => (
          <StaggerItem className="cert-card" key={c.name}>
            <SpotlightCard>
              <span className="issuer">{c.issuer}</span>
              <h3>{c.name}</h3>
            </SpotlightCard>
          </StaggerItem>
        ))}
      </Stagger>

      <Footer />
    </>
  );
}
