import { certsCompleted } from "../data.js";
import { Reveal, Stagger, StaggerItem, SpotlightCard } from "../lib/motion.jsx";
import Footer from "../components/Footer.jsx";

function CertGrid({ items }) {
  return (
    <Stagger className="masonry" gap={0.03}>
      {items.map((c) => (
        <StaggerItem className="cert-card" key={c.name}>
          <SpotlightCard>
            <span className="issuer">{c.issuer}</span>
            <h3>{c.name}</h3>
          </SpotlightCard>
        </StaggerItem>
      ))}
    </Stagger>
  );
}

export default function Certifications() {
  return (
    <>
      <div className="subhead">
        <Reveal as="div" className="label">Credentials</Reveal>
        <Reveal as="h1" delay={0.05}>Certifications</Reveal>
        <Reveal as="p" delay={0.1}>
          A curated set of credentials, matching my LinkedIn: cloud security, security operations,
          incident response, AI and statistics, from Microsoft, IBM, TryHackMe, Princeton and
          LinkedIn Learning.
        </Reveal>
      </div>

      <CertGrid items={certsCompleted} />

      <Footer />
    </>
  );
}
