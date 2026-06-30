import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { profile, focus, stack, experience, certHighlights } from "../data.js";
import { Reveal, Stagger, StaggerItem, SpotlightCard, Magnetic } from "../lib/motion.jsx";
import Footer from "../components/Footer.jsx";
import LocalTime from "../components/LocalTime.jsx";

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
      <section className="hero">
        <motion.div
          className="hero-head"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="avatar" aria-hidden>UJ</div>
          <div className="avatar-meta">
            <div className="nm">{profile.name}</div>
            <div className="rl">{profile.role}</div>
          </div>
        </motion.div>

        <motion.h1
          className="hero-lead"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
        >
          I secure <span className="hl">networks</span> and the systems on them.
        </motion.h1>

        <Reveal as="p" className="hero-body" delay={0.1}>{profile.intro}</Reveal>

        <Stagger className="profiles" gap={0.06}>
          <StaggerItem as="span"><Magnetic as="a" className="pill" href={profile.github} target="_blank" rel="noopener">GitHub</Magnetic></StaggerItem>
          <StaggerItem as="span"><Magnetic as="a" className="pill" href={profile.linkedin} target="_blank" rel="noopener">LinkedIn</Magnetic></StaggerItem>
          <StaggerItem as="span"><Magnetic as="a" className="pill" href={`mailto:${profile.email}`}>Email</Magnetic></StaggerItem>
        </Stagger>
      </section>

      <Row label="About me">
        {profile.about.map((p, i) => (
          <Reveal as="p" key={i} className={i ? "muted" : ""} delay={i * 0.05}>{p}</Reveal>
        ))}
      </Row>

      <Row label="What I focus on">
        <Stagger className="tags" gap={0.04} as="ul">
          {focus.map((f) => (<StaggerItem as="li" key={f}>{f}</StaggerItem>))}
        </Stagger>
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

      <Row label="Certifications">
        <Stagger className="cert-mini" gap={0.05}>
          {certHighlights.map((c) => (
            <StaggerItem key={c.name}>
              <Link to="/certifications">
                <SpotlightCard className="cert-chip">
                  <span className="issuer">{c.issuer}{c.status === "progress" && <span className="tag-progress">in progress</span>}</span>
                  <span className="nm">{c.name}</span>
                </SpotlightCard>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
        <div className="see-all"><Link className="alink" to="/certifications">See all certifications</Link></div>
      </Row>

      <Row label="Security research">
        <Reveal as="p" className="muted">
          Alongside the labs and CTFs I work on applied security research, including zero-trust network architecture and secure communication for cyber-physical systems.
        </Reveal>
        <div className="see-all"><Link className="alink" to="/research">Read the research</Link></div>
      </Row>

      <Reveal as="p" className="cta-line">Got a role or a project? <span className="hl">Let's talk.</span></Reveal>

      <Row label="Contact">
        <div className="kv">
          <a className="alink" href={`mailto:${profile.email}`}>{profile.email}</a>
          <a className="alink" href={`tel:${profile.phone.replace(/\s/g, "")}`}>{profile.phone}</a>
          <span className="muted">{profile.location}</span>
        </div>
      </Row>

      <Row label="Local time"><LocalTime /></Row>

      <Footer />
    </>
  );
}
