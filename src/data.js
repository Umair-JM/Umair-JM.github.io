// Content for the cybersecurity and networking portfolio.
// Voice: plain first person, no dashes, no repetitive "I am X, I am Y" lines.
// The narrative runs networks to security, with a security thread through
// every role. The PhD stays in the background and its subject is not named.

export const profile = {
  name: "Umair Javaid Manj",
  role: "Cybersecurity & Networking",
  location: "Auckland, New Zealand",
  email: "umairjavaidmanj@gmail.com",
  phone: "+64 20 4483186",
  github: "https://github.com/Umair-JM",
  linkedin: "https://linkedin.com/in/umairjm",
  lead: "I secure networks and the systems that run on them.",
  intro:
    "My path into security started with networks. I configured and hardened the kit that keeps traffic moving, and the more I understood how that traffic could be abused, the further I moved into defending it. Since then I have researched cryptography and the security of machine learning systems, taught smart contract and blockchain security to full classrooms, and spent my own time in SOC labs and capture the flag events.",
  about: [
    "Computer engineering is my foundation, and most of my hands on time goes into security monitoring, threat intelligence, incident response and network defense. I like working out how systems talk to each other, then how they break, then how to keep them from breaking.",
    "I am looking for security analyst work in Auckland where I can put that to use, building detections, triaging alerts and keeping networks defensible.",
  ],
};

export const focus = [
  "Security Operations",
  "Threat Intelligence",
  "Incident Response",
  "Network Defense",
  "Vulnerability Assessment",
  "Endpoint Security",
  "Detection Engineering",
  "Network Hardening",
];

export const stack = {
  Languages: ["Python", "C++", "Bash", "PowerShell"],
  "Security operations": ["Microsoft Sentinel", "Splunk", "KQL", "Microsoft Defender", "MITRE ATT&CK", "NIST CSF"],
  Networking: ["TCP/IP", "Routing & Switching", "VLANs", "Subnetting", "Firewalls", "IDS / IPS", "ACLs", "Cisco IOS"],
  Tooling: ["Nmap", "Wireshark", "Burp Suite", "Metasploit", "Nessus", "Packet Tracer"],
};

// Marquee rows on the home page.
export const marqueeA = ["Security Operations", "Threat Intelligence", "Incident Response", "Network Defense", "Detection Engineering", "Vulnerability Assessment", "Endpoint Security"];
export const marqueeB = ["Microsoft Sentinel", "KQL", "MITRE ATT&CK", "Wireshark", "Nmap", "Burp Suite", "Cisco IOS", "NIST CSF", "Splunk", "Nessus"];

export const experience = [
  {
    role: "Program Manager",
    org: "Coding, Robotics & AI Learning Project, NUST",
    date: "2024 to 2025",
    blurb:
      "Ran a national training program covering cybersecurity, networking and AI, coordinating 80 instructors, setting delivery standards and reporting on quality and outcomes.",
  },
  {
    role: "Instructor",
    org: "HISDP, AI Lounge & Murabbi, NUST",
    date: "2023 to 2024",
    blurb:
      "Taught smart contract security, blockchain security and security tooling, built the hands on labs and capture the flag style assessments, and won a Best Instructor award.",
  },
  {
    role: "Research Associate",
    org: "COGNET Lab, SEECS, NUST",
    date: "2022 to 2023",
    blurb:
      "Researched post quantum cryptography and hardened machine learning models against adversarial attacks, working through threat models and defensive techniques, and mentored junior researchers.",
  },
  {
    role: "Research Assistant",
    org: "COGNET Lab, SEECS, NUST",
    date: "2021 to 2022",
    blurb:
      "Built a tamper evident, verifiable voting system using cryptography and computer vision, implementing integrity checks for end to end auditing.",
  },
  {
    role: "Network Engineer",
    org: "Nexalink",
    date: "2016 to 2017",
    blurb:
      "Configured and hardened routers, switches and firewalls, set up VLAN segmentation and access control lists, monitored traffic, and secured IoT deployments.",
  },
];

// Recruiter facing projects. Each one is real work, framed by outcome and the
// tools used, grouped so a hiring manager can scan security and networking
// depth at a glance. `featured` surfaces the lead project at the top.
export const projects = [
  {
    title: "Detection engineering home lab",
    domain: "Security operations",
    cert: "SOC",
    featured: true,
    outcome: "End to end SOC workflow, from raw logs to triaged, ATT&CK mapped incidents",
    blurb:
      "Stood up a Microsoft Sentinel workspace, ingested sign in, identity and endpoint logs, and authored scheduled analytics rules that flag suspicious sign ins and lateral movement. Tuned the rules to cut noisy positives and mapped every detection to MITRE ATT&CK so an alert reads as a story, not a row in a table.",
    tags: ["Microsoft Sentinel", "KQL", "MITRE ATT&CK", "Microsoft Defender"],
  },
  {
    title: "Threat hunting query pack",
    domain: "Security operations",
    cert: "SOC",
    outcome: "Reusable KQL hunts that surface brute force and anomalous process activity",
    blurb:
      "Wrote KQL across sign in and device tables to hunt brute force attempts, impossible travel and unusual process execution, then packaged the queries as a reusable hunting set with notes on the signal behind each one.",
    tags: ["KQL", "Threat hunting", "Microsoft Sentinel"],
  },
  {
    title: "Incident investigation and IR runbook",
    domain: "Security operations",
    cert: "SOC",
    outcome: "A repeatable triage path that shortens time to a decision",
    blurb:
      "Triaged incidents in Microsoft Defender, reconstructed alert timelines across identity and endpoint, scoped blast radius, and wrote a short incident response runbook so the same investigation can be repeated under pressure.",
    tags: ["Microsoft Defender", "Incident Response", "MITRE ATT&CK"],
  },
  {
    title: "Tamper evident voting system",
    domain: "Applied security research",
    cert: "Research",
    outcome: "End to end auditable system with cryptographic integrity checks",
    blurb:
      "Built a verifiable voting system that pairs cryptographic integrity checks with computer vision, so every ballot is tamper evident and the result can be audited end to end. Designed the threat model first, then the controls to defeat it.",
    tags: ["Cryptography", "Threat modeling", "Computer vision", "Python"],
  },
  {
    title: "Segmented enterprise network",
    domain: "Networking",
    cert: "Network",
    outcome: "A defensible network design with isolation built in, not bolted on",
    blurb:
      "Designed a segmented network with VLANs, 802.1Q trunking and inter VLAN routing, then hardened the access layer with port security and disabled unused services. Segmentation chosen so a compromise in one zone does not become a compromise of all of them.",
    tags: ["VLANs", "Inter-VLAN routing", "Port security", "Cisco IOS"],
  },
  {
    title: "OSPF routing with ACL filtering",
    domain: "Networking",
    cert: "Network",
    outcome: "Dynamic routing plus least privilege traffic control between segments",
    blurb:
      "Configured OSPF for dynamic routing across a multi segment topology, then applied access control lists to enforce least privilege traffic flow between segments and log what was denied.",
    tags: ["OSPF", "ACLs", "Routing & switching", "Packet Tracer"],
  },
];

// Kept for any view that still expects the old shape.
export const certProjects = projects;

// Home-page preview. Earned credentials only; in-progress ones live on the
// Certifications page under their own honest heading.
export const certHighlights = [
  { issuer: "IBM", name: "Cybersecurity Analyst" },
  { issuer: "Cisco", name: "CCST Cybersecurity" },
  { issuer: "TryHackMe", name: "Jr Penetration Tester" },
  { issuer: "IBM", name: "Pen Testing, IR & Forensics" },
  { issuer: "Coursera", name: "Cyber Threat Intelligence" },
  { issuer: "Cisco", name: "Network Defense" },
];

export const certsCompleted = [
  { issuer: "IBM", name: "Cybersecurity Analyst, Professional Certificate" },
  { issuer: "TryHackMe", name: "Jr Penetration Tester" },
  { issuer: "IBM", name: "Penetration Testing, Incident Response & Forensics" },
  { issuer: "Cisco", name: "CCST Cybersecurity" },
  { issuer: "Coursera", name: "Cyber Threat Intelligence" },
  { issuer: "IBM", name: "Network Security & Database Vulnerabilities" },
  { issuer: "Cisco", name: "Network Defense" },
  { issuer: "IBM", name: "Cybersecurity Compliance Framework & System Administration" },
  { issuer: "Cisco", name: "Endpoint Security" },
  { issuer: "Coursera", name: "Cybersecurity Capstone: Breach Response Case Studies" },
  { issuer: "Cisco", name: "Cyber Threat Management" },
  { issuer: "IBM", name: "Introduction to Cybersecurity Tools & Cyber Attacks" },
  { issuer: "TryHackMe", name: "Pre Security, Learning Path" },
  { issuer: "Coursera", name: "Cybersecurity Roles, Processes & OS Security" },
  { issuer: "Cisco", name: "Networking Basics" },
  { issuer: "TryHackMe", name: "Web Fundamentals, Learning Path" },
  { issuer: "Cisco", name: "Network Devices & Initial Configuration" },
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

export const navGrid = [
  { to: "/certifications", label: "Certifications", note: "20+ security credentials" },
  { to: "/research", label: "Research", note: "Zero trust and secure systems" },
  { to: "/playground", label: "Projects", note: "Security & networking work, by outcome" },
  { to: "/guestbook", label: "Guestbook", note: "Leave a note" },
];

export const now = {
  date: "June 2026",
  text: "Building out my detection home lab and looking for a security analyst role in Auckland.",
};
