import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { profile, focus, stack, marqueeA, marqueeB, experience, projects, certHighlights, navGrid, now } from "../data.js";
import { Reveal, Stagger, StaggerItem, SpotlightCard, Magnetic } from "../lib/motion.jsx";
import Marquee from "../components/Marquee.jsx";
import WorldStrip from "../components/WorldStrip.jsx";
import Footer from "../components/Footer.jsx";

function Row({ label, children, id }) {
  return (
    <section className="row" id={id}>
      <Reveal as="div" className="row-label">{label}</Reveal>
      <div className="row-content">{children}</div>
    </section>
  );
}

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="hero hero-split">
        <div className="hero-copy">
          <motion.div className="label" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            Cybersecurity & Networking
          </motion.div>
          <motion.h1
            className="hero-lead"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            I secure <span className="hl">networks</span> and the systems that run on them.
          </motion.h1>
          <Reveal as="p" className="hero-body" delay={0.1}>{profile.intro}</Reveal>
          <Stagger className="profiles" gap={0.06}>
            <StaggerItem as="span"><Magnetic as="a" className="pill" href={profile.github} target="_blank" rel="noopener">GitHub</Magnetic></StaggerItem>
            <StaggerItem as="span"><Magnetic as="a" className="pill" href={profile.linkedin} target="_blank" rel="noopener">LinkedIn</Magnetic></StaggerItem>
            <StaggerItem as="span"><Magnetic as="a" className="pill" href={`mailto:${profile.email}`}>Email</Magnetic></StaggerItem>
          </Stagger>
        </div>
        <motion.div
          className="hero-portrait"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.img
            src="/portrait.png"
            alt="Umair Javaid Manj"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            draggable="false"
          />
        </motion.div>
      </section>

      <Marquee items={marqueeA} speed={30} />

      <Row label="About me">
        {profile.about.map((p, i) => (
          <Reveal as="p" key={i} className={i ? "muted" : ""} delay={i * 0.05}>{p}</Reveal>
        ))}
      </Row>

      <Row label="Stack & tools">
        {Object.entries(stack).map(([group, items]) => (
          <div className="stack-group" key={group}>
            <h4>{group}</h4>
            <Stagger className="tags" gap={0.03} as="ul">
              {items.map((t) => (<StaggerItem as="li" key={t}>{t}</StaggerItem>))}
            </Stagger>
          </div>
        ))}
      </Row>

      <Row label="Experience" id="experience">
        <div className="xp-list">
          {experience.map((x, i) => (
            <Reveal className="xp-item" key={x.role} delay={Math.min(i * 0.04, 0.2)}>
              <div className="xp-top"><h4>{x.role}</h4><span className="xp-date">{x.date}</span></div>
              <div className="xp-org">{x.org}</div>
              <p>{x.blurb}</p>
            </Reveal>
          ))}
        </div>
      </Row>

      <Row label="Hands-on work">
        <Stagger className="proj-grid" gap={0.06}>
          {projects.map((p) => (
            <StaggerItem key={p.title}>
              <SpotlightCard className="proj-card">
                <h4>{p.title}</h4>
                <p>{p.blurb}</p>
                <div className="mini-tags">{p.tags.map((t) => (<span key={t}>{t}</span>))}</div>
              </SpotlightCard>
            </StaggerItem>
          ))}
        </Stagger>
      </Row>

      <Row label="Certifications">
        <Stagger className="cert-mini" gap={0.05}>
          {certHighlights.map((c) => (
            <StaggerItem key={c.name}>
              <Link to="/certifications">
                <SpotlightCard className="cert-chip">
                  <span className="issuer">{c.issuer}</span>
                  <span className="nm">{c.name}</span>
                </SpotlightCard>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
        <div className="see-all"><Link className="alink" to="/certifications">See all certifications</Link></div>
      </Row>

      <Marquee items={marqueeB} reverse speed={36} />

      <Reveal as="p" className="cta-line">Got a role or a project? <span className="hl">Let's talk.</span></Reveal>

      <Row label="Contact">
        <div className="kv">
          <a className="alink" href={`mailto:${profile.email}`}>{profile.email}</a>
          <a className="alink" href={`tel:${profile.phone.replace(/\s/g, "")}`}>{profile.phone}</a>
          <span className="muted">{profile.location}</span>
        </div>
      </Row>

      <Row label="Time & weather"><WorldStrip /></Row>

      <Row label="Explore">
        <Stagger className="nav-grid" gap={0.05}>
          {navGrid.map((n) => (
            <StaggerItem key={n.to}>
              <Link to={n.to}>
                <SpotlightCard className="nav-card">
                  <span className="nav-card-label">{n.label}</span>
                  <span className="nav-card-note">{n.note}</span>
                  <span className="nav-card-arrow">↗</span>
                </SpotlightCard>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      </Row>

      <Row label="Now">
        <Reveal as="p">{now.text}</Reveal>
        <Reveal as="p" className="muted" delay={0.05}>Updated {now.date}.</Reveal>
      </Row>

      <Footer />
    </>
  );
}
