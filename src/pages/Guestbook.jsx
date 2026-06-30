import { useState, useEffect } from "react";
import { Reveal } from "../lib/motion.jsx";
import Footer from "../components/Footer.jsx";

const KEY = "guestbook";
function load() {
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
}

export default function Guestbook() {
  const [msgs, setMsgs] = useState([]);
  const [name, setName] = useState("");
  const [text, setText] = useState("");

  useEffect(() => { setMsgs(load()); }, []);

  function submit(e) {
    e.preventDefault();
    if (!name.trim() || !text.trim()) return;
    const entry = {
      name: name.trim().slice(0, 40),
      text: text.trim().slice(0, 280),
      when: new Date().toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }),
    };
    const next = [entry, ...msgs].slice(0, 50);
    setMsgs(next);
    localStorage.setItem(KEY, JSON.stringify(next));
    setName(""); setText("");
  }

  return (
    <>
      <div className="subhead">
        <Reveal as="div" className="label">Say hi</Reveal>
        <Reveal as="h1" delay={0.05}>Guestbook</Reveal>
        <Reveal as="p" delay={0.1}>Drop a note, say hi, or leave a thought.</Reveal>
      </div>

      <form className="gb-form" onSubmit={submit}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" aria-label="Your name" />
        <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Your message" aria-label="Your message" />
        <button className="pill" type="submit">Send</button>
      </form>

      <div className="gb-list">
        {msgs.length === 0 ? (
          <p className="muted">No messages yet. Be the first.</p>
        ) : (
          msgs.map((m, i) => (
            <Reveal className="gb-msg" key={i} delay={Math.min(i * 0.03, 0.15)}>
              <span className="gb-who">{m.name}</span>
              <span className="gb-when">{m.when}</span>
              <p className="gb-text">{m.text}</p>
            </Reveal>
          ))
        )}
      </div>

      <Footer />
    </>
  );
}
