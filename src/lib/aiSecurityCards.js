/* ---------------------------------------------------------------------------
   One card per hoop made. The four sections are the ones TryHackMe's AI1
   exam is built from (threat modelling, prompt injection and jailbreaking,
   AI supply chain, data poisoning), and the tags are OWASP Top 10 for LLM
   Applications identifiers. Content is written from those two public
   frameworks, not copied from any course material.
--------------------------------------------------------------------------- */

export const CARDS = [
  // Threat modelling: analyse the architecture, find where trust breaks.
  {
    section: "Threat modelling",
    tag: "LLM05",
    title: "Model output is untrusted input",
    body: "Anything the model returns can carry an attacker's instructions. Validate it before it reaches a shell, a query, a browser or another agent.",
  },
  {
    section: "Threat modelling",
    tag: "LLM01",
    title: "Map every way text gets in",
    body: "User prompt, system prompt, retrieved documents, tool results, file uploads, image text. Each one is an injection point, and the quiet ones are the dangerous ones.",
  },
  {
    section: "Threat modelling",
    tag: "LLM06",
    title: "Score the blast radius, not the model",
    body: "A read only assistant that can only search is a small problem. The same model holding shell access and cloud credentials is a different system entirely.",
  },
  {
    section: "Threat modelling",
    tag: "ATLAS",
    title: "Name techniques with MITRE ATLAS",
    body: "ATLAS is the ATT&CK style matrix for attacks on machine learning systems. Use its technique names in findings so defenders can map them to controls.",
  },
  {
    section: "Threat modelling",
    tag: "LLM10",
    title: "Unbounded consumption is a finding",
    body: "Token cost, context length and tool loops are denial of service and denial of wallet paths. Cap them per request and per user, not just globally.",
  },
  {
    section: "Threat modelling",
    tag: "LLM06",
    title: "An agent multiplies the surface",
    body: "Every tool an agent can call is one more way in and one more way out. Enumerate the tools and their scopes, not only the prompts.",
  },

  // Prompt injection and jailbreaking: attack the assistant, bypass guardrails.
  {
    section: "Prompt injection",
    tag: "LLM01",
    title: "Indirect injection is the one that scales",
    body: "Direct injection comes from the person typing. Indirect injection hides in a web page, a PDF, a calendar invite or an email the model reads on someone's behalf.",
  },
  {
    section: "Prompt injection",
    tag: "LLM01",
    title: "Guardrails are a speed bump",
    body: "A classifier in front of the model filters known phrasings. The capability behind it is unchanged, so treat a guardrail as a speed bump and never as the control.",
  },
  {
    section: "Prompt injection",
    tag: "LLM07",
    title: "System prompts leak",
    body: "They travel with every request and come back under pressure. No keys, no internal URLs, and never the only copy of a rule you depend on.",
  },
  {
    section: "Prompt injection",
    tag: "LLM06",
    title: "Fix injection with privilege, not wording",
    body: "Better instructions lose to a better attacker. Narrow tools, per call scopes and a human approval step on writes survive prompts you have not thought of.",
  },
  {
    section: "Prompt injection",
    tag: "LLM02",
    title: "Watch what the answer carries out",
    body: "Exfiltration often rides in a rendered image URL, a markdown link or a tool argument. Check outbound content, not only the text shown to the user.",
  },
  {
    section: "Prompt injection",
    tag: "LLM01",
    title: "Jailbreaks come in families",
    body: "Roleplay, encoding, translation, long context, many shot. Test the family, because a filter tuned to one phrasing misses the next one.",
  },
  {
    section: "Prompt injection",
    tag: "LLM01",
    title: "The attack can take ten turns",
    body: "Context accumulates. A refusal in the first turn is often undone by patient setup, so test conversations, not single messages.",
  },

  // AI supply chain: triage model artefacts for tampering.
  {
    section: "Supply chain",
    tag: "LLM03",
    title: "A pickled checkpoint can run code",
    body: "Loading a pickle backed model file can execute whatever was packed into it. Prefer safetensors, keep weights only loading on, and open unknown weights in a sandbox.",
  },
  {
    section: "Supply chain",
    tag: "LLM03",
    title: "Pin weights like packages",
    body: "Hashes, versions and a named publisher. A repository name on a model hub is not provenance, and neither is a download count.",
  },
  {
    section: "Supply chain",
    tag: "LLM03",
    title: "Typosquatting reaches model hubs too",
    body: "Near identical repository names, copied model cards and fresh accounts are the pattern. Check history and publisher before you pull the weights.",
  },
  {
    section: "Supply chain",
    tag: "LLM03",
    title: "Adapters and plugins inherit the trust",
    body: "A LoRA adapter, a tokenizer, a custom loading script and an MCP server all run inside your trust boundary. Review them the way you review a dependency.",
  },
  {
    section: "Supply chain",
    tag: "LLM04",
    title: "A fine tune inherits its parent",
    body: "Whatever is hidden in a base model survives fine tuning and gets harder to see. Provenance has to cover the base, not only your run.",
  },
  {
    section: "Supply chain",
    tag: "LLM03",
    title: "Sign what you ship",
    body: "Internal model artefacts deserve the same signatures and attestations as builds. Without them, rollback and incident response are guesswork.",
  },

  // Data poisoning: craft and defend against RAG attacks.
  {
    section: "Data poisoning",
    tag: "LLM08",
    title: "The retrieval index is an attack surface",
    body: "If a user can add a document, a user can add instructions. Poisoned chunks are retrieved and trusted exactly like the real ones.",
  },
  {
    section: "Data poisoning",
    tag: "LLM04",
    title: "Backdoors hide behind normal accuracy",
    body: "A rare trigger phrase can flip a model's behaviour while every headline metric stays healthy. Accuracy testing does not detect a backdoor.",
  },
  {
    section: "Data poisoning",
    tag: "LLM04",
    title: "Scale does not protect the training set",
    body: "Poisoning works on the number of planted samples, not only on their share of the data, so a bigger corpus is not automatically a safer one.",
  },
  {
    section: "Data poisoning",
    tag: "LLM08",
    title: "Give every chunk a provenance",
    body: "Filter at ingest, keep the source with the chunk, cap how far one source can swing an answer, and re-check retrieved text before it reaches the model.",
  },
  {
    section: "Data poisoning",
    tag: "LLM09",
    title: "Grounding is not proof",
    body: "A retrieved citation can be real and still not support the sentence it sits beside. Check that the claim matches the source, not just that a source exists.",
  },
  {
    section: "Data poisoning",
    tag: "LLM08",
    title: "Embeddings are not anonymous",
    body: "Vectors can be inverted back to something close to the source text. Treat the index as the sensitive store the documents were.",
  },
];

export const SECTIONS = [...new Set(CARDS.map((c) => c.section))];

// Self-check: `node src/lib/aiSecurityCards.js`
if (typeof process !== "undefined" && process.argv[1] && /aiSecurityCards\.js$/.test(process.argv[1])) {
  const dash = CARDS.find((c) => /[–—]/.test(c.title + c.body));
  console.assert(!dash, "no en or em dashes in card text", dash);
  console.assert(CARDS.every((c) => c.title.length <= 46), "titles stay short");
  console.assert(CARDS.every((c) => c.body.length <= 190), "bodies stay short",
    CARDS.filter((c) => c.body.length > 190).map((c) => [c.title, c.body.length]));
  console.assert(new Set(CARDS.map((c) => c.title)).size === CARDS.length, "titles are unique");
  console.assert(SECTIONS.length === 4, "four AI1 sections", SECTIONS);
  console.assert(CARDS.length === 25, "25 cards, one per two hoops over fifty hoops", CARDS.length);
  console.log("cards ok", CARDS.length, SECTIONS);
}
