import { projects } from "../data.js";
import { Reveal, Stagger, StaggerItem, SpotlightCard } from "../lib/motion.jsx";
import Footer from "../components/Footer.jsx";

// Order the domain groups so security leads, networking follows, research closes.
const ORDER = ["Security operations", "Networking", "Applied security research"];

function group(list) {
  const byDomain = {};
  list.forEach((p) => {
    (byDomain[p.domain] ||= []).push(p);
  });
  return Object.keys(byDomain)
    .sort((a, b) => ORDER.indexOf(a) - ORDER.indexOf(b))
    .map((domain) => ({ domain, items: byDomain[domain] }));
}

function ProjectCard({ p }) {
  return (
    <SpotlightCard className="proj-card lab-card">
      <div className="lab-top">
        <h3>{p.title}</h3>
        <span className="lab-cert">{p.cert}</span>
      </div>
      {p.outcome && <p className="proj-outcome">{p.outcome}</p>}
      <p>{p.blurb}</p>
      {p.tags && (
        <div className="mini-tags">
          {p.tags.map((t) => (
            <span key={t}>{t}</span>
          ))}
        </div>
      )}
    </SpotlightCard>
  );
}

export default function Playground() {
  const featured = projects.find((p) => p.featured);
  const rest = projects.filter((p) => p !== featured);

  return (
    <>
      <div className="subhead">
        <Reveal as="div" className="label">Selected work</Reveal>
        <Reveal as="h1" delay={0.05}>Projects</Reveal>
        <Reveal as="p" delay={0.1}>
          Security and networking projects, each framed by the outcome and the tools used.
        </Reveal>
      </div>

      {featured && (
        <Reveal>
          <SpotlightCard className="proj-featured">
            <span className="proj-featured-tag">Featured</span>
            <div className="lab-top">
              <h3>{featured.title}</h3>
              <span className="lab-cert">{featured.cert}</span>
            </div>
            {featured.outcome && <p className="proj-outcome">{featured.outcome}</p>}
            <p>{featured.blurb}</p>
            {featured.tags && (
              <div className="mini-tags">
                {featured.tags.map((t) => (
                  <span key={t}>{t}</span>
                ))}
              </div>
            )}
          </SpotlightCard>
        </Reveal>
      )}

      {group(rest).map(({ domain, items }) => (
        <section key={domain} className="proj-group">
          <Reveal as="h2" className="group-title">{domain}</Reveal>
          <Stagger className="proj-stack" gap={0.05}>
            {items.map((p) => (
              <StaggerItem key={p.title}>
                <ProjectCard p={p} />
              </StaggerItem>
            ))}
          </Stagger>
        </section>
      ))}

      <Footer />
    </>
  );
}
