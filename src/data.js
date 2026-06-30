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
    role: "Program Manager, Technical Education",
    org: "Coding, Robotics & AI Learning Project, NUST",
    date: "2024 to 2025",
    blurb:
      "Ran a national training program covering cybersecurity, networking and AI, coordinating 80 instructors, setting delivery standards and reporting on quality and outcomes.",
  },
  {
    role: "Instructor, Blockchain & Cybersecurity",
    org: "HISDP, AI Lounge & Murabbi, NUST",
    date: "2023 to 2024",
    blurb:
      "Taught smart contract security, blockchain security and security tooling to a class of 106, built the hands on labs and capture the flag style assessments, and won a Best Instructor award at 9.15 of 10.",
  },
  {
    role: "Security Researcher",
    org: "COGNET Lab, SEECS, NUST",
    date: "2022 to 2023",
    blurb:
      "Researched post quantum cryptography and hardened machine learning models against adversarial attacks, working through threat models and defensive techniques, and mentored junior researchers.",
  },
  {
    role: "Secure Systems Researcher",
    org: "COGNET Lab, SEECS, NUST",
    date: "2021 to 2022",
    blurb:
      "Built a tamper evident, verifiable voting system using cryptography and computer vision, implementing integrity checks for end to end auditing.",
  },
  {
    role: "Network & Security Engineer",
    org: "Dewaan Networking Solutions",
    date: "2016 to 2017",
    blurb:
      "Configured and hardened routers, switches and firewalls, set up VLAN segmentation and access control lists, monitored traffic, and secured IoT deployments.",
  },
];

export const projects = [
  {
    title: "Detection and SOC home lab",
    blurb:
      "Stood up a Microsoft Sentinel lab, ingested Windows and network logs, wrote KQL detections mapped to MITRE ATT&CK, and triaged simulated alerts end to end.",
    tags: ["Sentinel", "KQL", "MITRE ATT&CK"],
  },
  {
    title: "Offensive practice paths",
    blurb:
      "Worked the TryHackMe Jr Penetration Tester, Pre Security and Web Fundamentals paths, practising enumeration, web exploitation and privilege escalation in lab environments.",
    tags: ["Enumeration", "Web exploitation", "Privesc"],
  },
];

export const certHighlights = [
  { issuer: "IBM", name: "Cybersecurity Analyst" },
  { issuer: "Microsoft", name: "SC-200 Security Operations" },
  { issuer: "Cisco", name: "CCNA" },
  { issuer: "TryHackMe", name: "Jr Penetration Tester" },
  { issuer: "Cisco", name: "CCST Cybersecurity" },
  { issuer: "IBM", name: "Pen Testing, IR & Forensics" },
];

export const certsCompleted = [
  { issuer: "Microsoft", name: "SC-200, Security Operations Analyst" },
  { issuer: "Cisco", name: "CCNA, Cisco Certified Network Associate" },
  { issuer: "n8n", name: "Automation 101, 102 & 103" },
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

// Security relevant research only.
export const securityResearch = [
  {
    cite:
      "Haq, M. I. U., Manj, U. J., Farooqi, A. R., Rizvi, D. Q., Paracha, S. Q., & Rizvi, S. H. H. (2026). Cognitive cyber communication architecture with self-evolving AI agents for zero-trust 6G networks.",
    venue: "APAN 2026, Future Internet and R&E Networks track.",
    status: "Submitted",
  },
  {
    cite:
      "Haq, M. I. U., Manj, U. J., Paracha, S. Q., Imam, Y., Rizvi, D. Q., & Farooqi, A. R. (2026). Neuro-symbolic AI-driven secure communication framework for autonomous cyber-physical systems.",
    venue: "APAN 2026, AI, Machine Learning and Computer Vision track.",
    status: "Submitted",
  },
];

export const navGrid = [
  { to: "/certifications", label: "Certifications", note: "20+ security credentials" },
  { to: "/research", label: "Research", note: "Zero trust and secure systems" },
  { to: "/playground", label: "Playground", note: "Animated security experiments" },
  { to: "/guestbook", label: "Guestbook", note: "Leave a note" },
];

export const now = {
  date: "June 2026",
  text: "Building Sentinel detections in my home lab, finishing SC-200 and CCNA, and looking for part time security analyst work in Auckland.",
};
