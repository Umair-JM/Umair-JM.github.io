// Content for the cybersecurity and networking portfolio.
// PhD is kept in the background and the health subject is not named here, by
// design. Voice is plain first person, no dashes.

export const profile = {
  name: "Umair Javaid Manj",
  role: "Cybersecurity & Networking",
  location: "Auckland, New Zealand",
  email: "umairjavaidmanj@gmail.com",
  phone: "+64 20 4483186",
  github: "https://github.com/Umair-JM",
  linkedin: "https://linkedin.com/in/umairjm",
  lead:
    "I work in cybersecurity and networking, and that is where I am building my career.",
  intro:
    "I came into this through networks first, then security research. I have configured and fixed networks as a junior network engineer, worked on cryptography and machine learning security at NUST's COGNET Lab, and earned more than 20 certifications from IBM, Cisco and TryHackMe. Most weekends I am in a lab or a CTF. I am also doing a PhD in applied AI on the side, but security and networking are the day job.",
  about: [
    "I am a security and networking person at heart. I like working out how systems talk to each other, then how they break, and how to keep them from breaking. My base is computer engineering, and most of my hands on time has gone into network configuration, security monitoring, threat intelligence and incident response.",
    "I am looking for part time and contract security work in Auckland that I can run alongside my doctoral study. Security Analyst and SOC Analyst roles are the target, and I hold New Zealand work rights.",
  ],
};

export const focus = [
  "Security Operations",
  "Threat Intelligence",
  "Incident Response",
  "Vulnerability Assessment",
  "Network Defense",
  "Endpoint Security",
  "Penetration Testing",
];

export const stack = {
  Languages: ["C++", "Python", "Bash", "PowerShell"],
  "Security tooling": ["Nmap", "Wireshark", "Metasploit", "Burp Suite", "Nikto", "WPScan", "Nessus"],
  Networking: ["TCP/IP", "Routing & Switching", "VLANs", "Subnetting", "Firewalls", "IDS / IPS", "Cisco IOS"],
  "Frameworks & platforms": ["NIST CSF", "MITRE ATT&CK", "SIEM / SOC", "Microsoft Sentinel", "Linux", "Windows"],
};

export const experience = [
  {
    role: "Project Manager",
    org: "Coding, Robotics & AI Learning Project, NUST",
    date: "2024 to 2025",
    blurb:
      "Ran a national STEAM training project, coordinating 80 trainers, tracking delivery against standards and reporting on outcomes.",
  },
  {
    role: "Instructor, Security & Blockchain",
    org: "HISDP, AI Lounge & Murabbi, NUST",
    date: "2023 to 2024",
    blurb:
      "Taught security and blockchain to a class of 106, built the labs and assessments, and won a Best Instructor award (9.15 of 10).",
  },
  {
    role: "Research Associate, Security & ML",
    org: "COGNET Lab, SEECS, NUST",
    date: "2022 to 2023",
    blurb:
      "Worked on quantum resistant cryptography and on defending machine learning models against adversarial attacks.",
  },
  {
    role: "Research Assistant, Secure Systems",
    org: "COGNET Lab, SEECS, NUST",
    date: "2021 to 2022",
    blurb:
      "Built a verifiable voting system that kept ballots tamper evident using computer vision and cryptography.",
  },
  {
    role: "Junior Network Engineer",
    org: "Dewaan Networking Solutions",
    date: "2016 to 2017",
    blurb:
      "Configured and maintained networks and IoT gear, ran routine checkups, and repaired hardware when it failed.",
  },
];

// Featured certs on the home page.
export const certHighlights = [
  { issuer: "IBM", name: "Cybersecurity Analyst", status: "done" },
  { issuer: "Microsoft", name: "SC-200 Security Operations", status: "progress" },
  { issuer: "Cisco", name: "CCNA", status: "progress" },
  { issuer: "TryHackMe", name: "Jr Penetration Tester", status: "done" },
  { issuer: "Cisco", name: "CCST Cybersecurity", status: "done" },
  { issuer: "IBM", name: "Pen Testing, IR & Forensics", status: "done" },
];

// Full certifications list for the certifications page.
export const certsInProgress = [
  { issuer: "Microsoft", name: "SC-200, Security Operations Analyst" },
  { issuer: "Cisco", name: "CCNA, Cisco Certified Network Associate" },
  { issuer: "n8n", name: "Automation 101, 102 & 103" },
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

// Only the security relevant research is surfaced on the cyber site.
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
