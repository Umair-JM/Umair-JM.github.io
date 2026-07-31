// Content for the portfolio. Voice: plain first person, short lines, no
// adjective padding. Positioning bridges data & AI governance (current role)
// with the real cybersecurity and networking base. Certifications mirror the
// curated LinkedIn set. The PhD stays in the background.

export const profile = {
  name: "Umair Javaid Manj",
  role: "Data & AI Governance · Cybersecurity",
  location: "Auckland, New Zealand",
  email: "umairjavaidmanj@gmail.com",
  phone: "+64 20 4483186",
  github: "https://github.com/Umair-JM",
  linkedin: "https://linkedin.com/in/umairjm",
  intro:
    "My path started with networks. I configured and hardened the kit that keeps traffic moving, then moved into security research, teaching and SOC lab work. From August 2026 I am a Data & AI Governance Analyst at the Centre for Chiropractic Research in Auckland, working on research data governance, AI risk and information security. I am open to GRC, security analyst and AI governance roles in Auckland.",
};

export const focus = [
  "Data Governance",
  "AI Risk & Governance",
  "Privacy Act 2020",
  "ISO/IEC 27001",
  "OWASP LLM Top 10",
  "Security Operations",
  "Incident Response",
  "Network Defense",
];

export const stack = {
  "Governance & risk": ["ISO/IEC 27001", "NIST AI RMF", "NIST CSF", "Privacy Act 2020", "OWASP LLM Top 10", "MITRE ATT&CK"],
  "Security operations": ["Microsoft Sentinel", "Splunk", "KQL", "Microsoft Defender"],
  Networking: ["TCP/IP", "Routing & Switching", "VLANs", "Subnetting", "Firewalls", "IDS / IPS", "ACLs", "Cisco IOS"],
  Tooling: ["Python", "PowerShell", "Bash", "Nmap", "Wireshark", "Burp Suite", "Nessus"],
};

export const experience = [
  {
    role: "Data & AI Governance Analyst",
    org: "Centre for Chiropractic Research, New Zealand College of Chiropractic",
    date: "2026 to 2027",
    blurb:
      "Starting August 2026: research data governance and privacy under the Privacy Act 2020, AI model and pipeline risk against the OWASP LLM Top 10 and NIST AI RMF, and an ISO/IEC 27001 aligned information risk register.",
  },
  {
    role: "Program Manager",
    org: "Coding, Robotics & AI Learning Project, NUST",
    date: "2024 to 2025",
    blurb: "Led a national cybersecurity, networking and AI training program with 80 instructors.",
  },
  {
    role: "Instructor",
    org: "HISDP, AI Lounge & Murabbi, NUST",
    date: "2023 to 2024",
    blurb: "Taught smart contract and blockchain security, built the hands on labs and CTF style assessments, and won a Best Instructor award.",
  },
  {
    role: "Research Associate",
    org: "COGNET Lab, SEECS, NUST",
    date: "2022 to 2023",
    blurb: "Researched post quantum cryptography and defences against adversarial attacks on machine learning models.",
  },
  {
    role: "Research Assistant",
    org: "COGNET Lab, SEECS, NUST",
    date: "2021 to 2022",
    blurb: "Built a tamper evident, cryptography based verifiable voting system with end to end audit controls.",
  },
  {
    role: "Network Engineer",
    org: "Nexalink",
    date: "2016 to 2017",
    blurb: "Configured and hardened routers, switches and firewalls, with VLAN segmentation and access control lists.",
  },
];

// Real work, framed by outcome. `featured` surfaces the lead project.
export const projects = [
  {
    title: "Detection engineering home lab",
    domain: "Security operations",
    cert: "SOC",
    featured: true,
    outcome: "End to end SOC workflow, from raw logs to triaged, ATT&CK mapped incidents",
    blurb:
      "Stood up a Microsoft Sentinel workspace, ingested sign in, identity and endpoint logs, and wrote analytics rules mapped to MITRE ATT&CK.",
    tags: ["Microsoft Sentinel", "KQL", "MITRE ATT&CK", "Microsoft Defender"],
  },
  {
    title: "Threat hunting query pack",
    domain: "Security operations",
    cert: "SOC",
    outcome: "Reusable KQL hunts that surface brute force and anomalous process activity",
    blurb:
      "Wrote KQL across sign in and device tables to hunt brute force attempts, impossible travel and unusual process execution.",
    tags: ["KQL", "Threat hunting", "Microsoft Sentinel"],
  },
  {
    title: "Incident investigation and IR runbook",
    domain: "Security operations",
    cert: "SOC",
    outcome: "A repeatable triage path that shortens time to a decision",
    blurb:
      "Triaged incidents in Microsoft Defender, reconstructed alert timelines across identity and endpoint, and wrote a short incident response runbook.",
    tags: ["Microsoft Defender", "Incident Response", "MITRE ATT&CK"],
  },
  {
    title: "Tamper evident voting system",
    domain: "Applied security research",
    cert: "Research",
    outcome: "End to end auditable system with cryptographic integrity checks",
    blurb:
      "Built a verifiable voting system that pairs cryptographic integrity checks with computer vision, designed threat model first.",
    tags: ["Cryptography", "Threat modeling", "Computer vision", "Python"],
  },
  {
    title: "Segmented enterprise network",
    domain: "Networking",
    cert: "Network",
    outcome: "A defensible network design with isolation built in, not bolted on",
    blurb:
      "Designed a segmented network with VLANs, 802.1Q trunking and inter VLAN routing, then hardened the access layer.",
    tags: ["VLANs", "Inter-VLAN routing", "Port security", "Cisco IOS"],
  },
  {
    title: "OSPF routing with ACL filtering",
    domain: "Networking",
    cert: "Network",
    outcome: "Dynamic routing plus least privilege traffic control between segments",
    blurb:
      "Configured OSPF across a multi segment topology, then applied access control lists to enforce least privilege traffic flow.",
    tags: ["OSPF", "ACLs", "Routing & switching", "Packet Tracer"],
  },
];

// Home-page preview, newest governance-direction credentials first.
export const certHighlights = [
  { issuer: "IBM", name: "Cybersecurity Analyst" },
  { issuer: "Microsoft", name: "AI Skills Fest 2026, Cloud Security" },
  { issuer: "LinkedIn", name: "Statistics Foundations 1–3" },
  { issuer: "Global AI Community", name: "Agents League, Creative Apps" },
  { issuer: "IBM", name: "Incident Response & Digital Forensics" },
  { issuer: "TryHackMe", name: "Jr Penetration Tester" },
];

// Mirrors the curated LinkedIn certifications list.
export const certsCompleted = [
  { issuer: "IBM", name: "Cybersecurity Analyst Specialization" },
  { issuer: "Microsoft", name: "AI Skills Fest 2026, Cloud Security" },
  { issuer: "Global AI Community", name: "Agents League, Creative Apps" },
  { issuer: "LinkedIn", name: "Statistics Foundations 1–3" },
  { issuer: "IBM", name: "Incident Response and Digital Forensics" },
  { issuer: "IBM", name: "Cybersecurity Assessment: CompTIA Security+ & CySA+" },
  { issuer: "TryHackMe", name: "Jr Penetration Tester Learning Path" },
  { issuer: "Princeton", name: "Bitcoin & Cryptocurrency Technologies" },
];

// Security relevant research only, from the authoritative publication list.
export const securityResearch = [
  {
    cite:
      "Haq, M. I. U., Manj, U. J., Paracha, S. Q., Imam, Y., Rizvi, D. Q., & Farooqi, A. R. (2026). Neuro-symbolic AI-driven secure communication framework for autonomous cyber-physical systems.",
    venue: "APAN 2026, Track 2: AI, Machine Learning and Computer Vision.",
    status: "Accepted",
  },
  {
    cite:
      "Haq, M. I. U., Manj, U. J., Farooqi, A. R., Rizvi, D. Q., Paracha, S. Q., & Rizvi, S. H. H. (2026). Cognitive cyber communication architecture with self-evolving AI agents for zero-trust 6G networks.",
    venue: "APAN 2026, Track 1: Future Internet, R&E Networks and Infrastructure.",
    status: "Submitted",
  },
  {
    cite:
      "Haq, M. I. U., Manj, U. J., Qamar, D., Imam, Y., Yasin, J., & Perwaiz, N. (2026). Rethinking intrusion detection evaluation: evidence of performance inflation under random data splits.",
    venue: "FIT26, Machine Learning and its Applications Track.",
    status: "Submitted",
  },
];
