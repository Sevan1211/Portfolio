/**
 * Single source of truth for every piece of portfolio content.
 *
 * Desktop OS, mobile, the terminal, and page metadata all render from this
 * file. Nothing here may be duplicated into a component: when the surfaces
 * each kept their own copy they silently drifted apart, and the site ended up
 * contradicting the resume on job titles, dates, and metrics.
 *
 * CONFIDENTIALITY RULES (Sevan is still employed at Rasmussen):
 *  - Describe the engineering; genericize the business.
 *  - Never name an employer's internal source systems, vendors, or tools that
 *    reveal their stack. Categories only ("ERP/field-service", "CRM").
 *  - Round platform scale figures. Exact counts read as if lifted from an
 *    internal dashboard.
 *  - No business logic, domain formulas, dollar figures, or strategy work.
 *  - No security-posture detail about a named employer (no severity counts).
 *  - Never publish a metric that has not been verified.
 */

export interface ExperienceEntry {
  id: string;
  company: string;
  role: string;
  dates: string;
  location: string;
  /** Full detail for the desktop OS. */
  bullets: string[];
  /** Condensed for mobile and the terminal. */
  summary: string[];
  tech: string[];
}

export interface SkillGroup {
  id: string;
  label: string;
  blurb: string;
  items: string[];
}

export interface ProjectLink {
  label: string;
  href: string;
}

export interface ProjectEntry {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  highlights: readonly string[];
  tech: readonly string[];
  status: string;
  role: string;
  monogram: string;
  accent: string;
  links: readonly ProjectLink[];
}

/* ── Identity ─────────────────────────────────────────────── */

export const IDENTITY = {
  name: "Sevan Lewis-Payne",
  /** One-line role identity. Used in metadata and headers. */
  title: "Data & Software Engineer",
  tagline: "Data Platforms · Backend Systems · AI Infrastructure",
  /** The primary narrative. Systems-oriented, not "passionate developer". */
  narrative:
    "Data and software engineer building governed data platforms, secure production applications, and AI-enabled developer tools.",
  availability:
    "Graduating May 2027 and available full-time. Focused on data platform, backend, and AI infrastructure engineering.",
  availabilityShort: "Available May 2027",
  location: "Omaha, NE",
  locationNote: "Omaha, NE (Open to Relocation)",
} as const;

/* ── Contact ──────────────────────────────────────────────── */

export const CONTACT = {
  email: "sevanllewispayne@gmail.com",
  emailSchool: "slewis-payne@unomaha.edu",
  github: "https://github.com/Sevan1211",
  githubLabel: "github.com/Sevan1211",
  linkedin: "https://www.linkedin.com/in/sevan-lewis-payne",
  linkedinLabel: "linkedin.com/in/sevan-lewis-payne",
  resumePath: "/resume/Sevan-Lewis-Payne-2026-Resume.pdf",
  location: "Omaha, NE (Open to Relocation)",
} as const;

/* ── About ────────────────────────────────────────────────── */

export const ABOUT = {
  heading: "About Me",
  /** Professional framing first; this is what a recruiter reads. */
  intro: [
    "I'm a Computer Science and Artificial Intelligence student at the University of Nebraska Omaha, and I work where data engineering and software engineering meet.",
    "My work has centered on turning fragmented systems into things that are governed, tested, and actually usable: rebuilding an enterprise data platform, integrating production source systems, implementing quality and CI/CD controls, and shipping secure production software.",
  ],
  /** The human part. Specific rather than generic. */
  personal: [
    "My journey into tech started early. I was programming LEGO robots as a kid, and in high school I took every tech class I could find: AP Computer Science, Information Security, Game Programming, and Robotics. That is when I knew technology was my future.",
    "When I'm not writing code, you'll find me on the golf course, gaming with friends, or traveling. I've been lucky enough to visit multiple countries and I'm always planning the next trip.",
  ],
  philosophy:
    "I care about the parts of engineering that make systems trustworthy: clear ownership, explicit contracts, data quality, testing, observability, secure defaults, and honest failure states.",
} as const;

/* ── Experience ───────────────────────────────────────────── */

export const EXPERIENCE: ExperienceEntry[] = [
  {
    id: "rasmussen",
    company: "Rasmussen Air and Gas Energy",
    role: "Data Engineering and Analytics Intern",
    dates: "August 2025 to Present",
    location: "Omaha, NE",
    bullets: [
      "Primary architect and implementer of a governed Snowflake and dbt data platform, rebuilt from the ground up around a bronze/silver/gold medallion architecture with a semantic metrics layer for governed analytics.",
      "Integrated six production source systems (ERP/field-service, CRM, advertising, inspection, telephony, and a legacy platform) through managed ingestion, owning schema-change response and downstream remodeling so upstream changes never silently broke analytics.",
      "Built a data-quality framework of 2,000+ automated tests spanning not-null and uniqueness constraints, referential integrity, accepted values, numeric ranges, compound keys, and custom business-rule checks, with freshness monitoring across 250+ sources.",
      "Implemented PR-gated CI/CD with isolated per-developer environments, test-and-build jobs into a validation environment, and production execution guards preventing unapproved builds against test or production.",
      "Designed tiered, lineage-aware execution so dashboard-critical models and their upstream dependencies build on a separate track from standard, weekly, and on-demand workloads.",
      "Administer Snowflake compute: SQL query optimization, warehouse sizing, and synchronization tuning to keep platform cost under control.",
      "Delivered governed data products used company-wide across finance, sales, operations, and executive reporting, translating business requirements into modeled, tested data rather than one-off queries.",
      "Built internal operations tooling in TypeScript and PostgreSQL to centralize asset records and maintenance workflows, replacing spreadsheet-based tracking.",
    ],
    summary: [
      "Rebuilt an enterprise Snowflake + dbt platform on a medallion architecture with a semantic metrics layer",
      "Integrated six production source systems with owned schema-change response",
      "2,000+ automated data-quality tests · 250+ freshness-monitored sources",
      "PR-gated CI/CD with isolated dev environments and production guards",
      "Snowflake administration and compute cost governance",
    ],
    tech: [
      "Snowflake",
      "dbt",
      "Fivetran",
      "SQL",
      "Python",
      "Metabase",
      "Power BI",
      "CI/CD",
      "TypeScript",
      "PostgreSQL",
    ],
  },
  {
    id: "fnbo",
    company: "First National Bank of Omaha",
    role: "Software Engineering Intern",
    dates: "Summers 2024 & 2025",
    location: "Omaha, NE",
    bullets: [
      "Led application-security remediation on a production commercial-card platform, resolving Snyk-identified vulnerabilities across the codebase and dependency tree, with fixes validated before release.",
      "Built React and TypeScript administrative workflows with personally implemented API integrations, enabling account administrators to manage users and credit limits.",
      "Improved ADA accessibility across production workflows through accessible UI patterns and ARIA labeling, validated through the team’s automated QA process.",
      "Authored Jest tests covering user interactions, form submissions, data validation, React components, utilities, and API flows in Docker-based development environments.",
      "Delivered production features on a seven-member agile team using GitLab and ServiceNow for sprint planning, code review, and standups, and presented completed work to the CTO and stakeholders.",
      "Contributed to a platform serving over 100,000 customers.",
    ],
    summary: [
      "Application-security remediation across a production commercial-card platform",
      "React + TypeScript admin workflows with hand-built API integrations",
      "ADA accessibility work validated through automated QA",
      "Jest coverage for interactions, validation, components, and API flows",
      "Seven-member agile team; demoed features to the CTO",
    ],
    tech: [
      "React",
      "TypeScript",
      "JavaScript",
      "Kotlin",
      "Jest",
      "Snyk",
      "Docker",
      "GitLab",
      "ServiceNow",
    ],
  },
  {
    id: "uno-it",
    company: "University of Nebraska Omaha",
    role: "IT Operations Specialist",
    dates: "August 2025 to Present",
    location: "Omaha, NE",
    bullets: [
      "Provide technical support to faculty and students, diagnosing and resolving hardware, software, and connectivity issues.",
      "Troubleshoot and maintain classroom technology including projectors, displays, and audiovisual systems.",
      "Handle device setup, configuration, and hardware repairs across Windows and macOS environments.",
      "Communicate technical solutions clearly to users with varying levels of technical experience.",
    ],
    summary: [
      "Technical support for faculty and students across hardware, software, and A/V",
      "Device setup and troubleshooting on Windows and macOS",
    ],
    tech: ["Windows", "macOS", "Hardware", "A/V Systems"],
  },
];

/* ── Education ────────────────────────────────────────────── */

export const EDUCATION = {
  school: "University of Nebraska Omaha",
  schoolShort: "UNO",
  degree: "B.S. in Computer Science and Artificial Intelligence",
  /** Compact display form for tight layouts (profile card, mobile). */
  degreeShort: "B.S. Computer Science & AI",
  minor: "Minor in Communication Studies",
  graduation: "Expected May 2027",
  location: "Omaha, NE",
  awards: [
    {
      name: "Rising Star Intern Award",
      detail:
        "University of Nebraska Omaha, 2025. Recognized for performing on par with full-time engineers during my internship at First National Bank of Omaha.",
    },
    {
      name: "Susan T. Buffett Scholarship",
      detail:
        "Full-ride scholarship covering tuition, room, board, and more through graduation.",
    },
  ],
  /** Completed. Verified against the official record. */
  coursework: [
    "Data Structures",
    "Introduction to Algorithms",
    "Database Management Systems",
    "Software Engineering",
    "Operating Systems",
    "Communication Networks",
    "Artificial Intelligence",
    "Principles of Programming Languages",
    "Theory of Computation",
    "Applied Statistics",
  ],
  /** Currently enrolled; never described as completed. */
  inProgress: [
    "Data Warehousing & Data Mining",
    "Secure System Design",
    "Computer Architecture",
    "AI Concepts",
  ],
} as const;

/* ── Skills ───────────────────────────────────────────────── */

export const SKILL_GROUPS: SkillGroup[] = [
  {
    id: "data",
    label: "Data Platforms",
    blurb:
      "Warehouse architecture, modeling, and data quality at production scale.",
    items: [
      "Snowflake",
      "dbt",
      "Fivetran",
      "Medallion architecture",
      "Dimensional modeling",
      "Semantic layers",
      "Data-quality testing",
      "Source freshness",
      "Schema-drift handling",
      "Metabase",
      "Power BI",
      "PostgreSQL",
      "SQL Server",
    ],
  },
  {
    id: "backend",
    label: "Backend & APIs",
    blurb: "Services, APIs, and the state behind them.",
    items: [
      "Go",
      "Python",
      "FastAPI",
      "Node.js",
      "REST APIs",
      "WebSockets",
      "Redis",
      "Multi-service architecture",
    ],
  },
  {
    id: "frontend",
    label: "Frontend & Product",
    blurb: "Interfaces that are accessible and hold up in production.",
    items: [
      "React",
      "TypeScript",
      "Next.js",
      "Three.js",
      "Tailwind CSS",
      "Accessible UI / ARIA",
    ],
  },
  {
    id: "infra",
    label: "Infrastructure & Delivery",
    blurb: "Getting things shipped, repeatably.",
    items: [
      "Docker",
      "CI/CD",
      "GitHub Actions",
      "Git",
      "GitLab",
      "Linux",
      "Azure VMs",
      "Azure Functions",
      "Azure API Management",
      "Azure Key Vault",
      "Azure Blob Storage",
      "Microsoft Entra ID",
    ],
  },
  {
    id: "security",
    label: "Security & Quality",
    blurb: "Making systems trustworthy and keeping them that way.",
    items: [
      "Snyk",
      "Jest",
      "OAuth 2.0",
      "Secure code execution",
      "Environment isolation",
      "Production guards",
      "Automated testing",
    ],
  },
  {
    id: "ai",
    label: "AI & Automation",
    blurb: "LLM-backed workflows and the plumbing that makes them reliable.",
    items: [
      "LLM integration",
      "AI-assisted workflows",
      "Structured model outputs",
      "Queue-based processing",
      "Scheduled workflows",
      "Idempotent pipelines",
    ],
  },
];

export const LANGUAGES = [
  "Python",
  "SQL",
  "TypeScript",
  "JavaScript",
  "Go",
  "Kotlin",
  "Java",
  "C",
] as const;

/* ── Featured projects ───────────────────────────────────── */

/**
 * The approved recruiter-facing project set. Private projects deliberately
 * omit repository links while still documenting public-safe architecture and
 * measured evidence approved by Sevan on 2026-08-26.
 */
export const PROJECTS = [
  {
    id: "p100",
    title: "p100",
    subtitle: "Local-First AI Coding Agent",
    description:
      "A two-mode local and cloud coding-agent controller engineered around the limits of one consumer laptop. Local mode makes a zero-cloud promise; Hybrid keeps the local agent in charge while dispatching bounded background specialists.",
    highlights: [
      "Measured 98.1 tokens/second sustained local decode and 73 tokens/second at 32K context on an 8 GB laptop GPU",
      "Single-GPU model lifecycle with route leases, drain-before-swap behavior, startup validation, and rollback after failure",
      "Staged reliability bundle covers 38 daemon regressions, 4 artifact-ledger tests, and 61 integration assertions",
    ],
    tech: ["Python", "JavaScript", "PowerShell", "llama.cpp", "CUDA", "JSONL"],
    status: "Private · Active v0.4",
    role: "Solo systems engineering",
    monogram: "P100",
    accent: "#176445",
    links: [],
  },
  {
    id: "prism",
    title: "PRISM",
    subtitle: "Source-Faithful Learning Interface",
    description:
      "A local-first research prototype that turns source material into paced semantic representations without claiming that faster display creates learning. The system keeps the original source, provenance, repair paths, and experimental boundaries visible.",
    highlights: [
      "Resumable, content-addressed PDF ingestion with parser-version invalidation and page-specific recovery",
      "Deterministic source-verbatim frames validated against exact indexed spans before storage",
      "Responsive React and FastAPI workflow with generated contracts, SQLite events, keyboard recovery, and reduced-motion behavior",
    ],
    tech: [
      "React",
      "TypeScript",
      "Python",
      "FastAPI",
      "SQLite",
      "OpenAPI",
      "PDF",
    ],
    status: "Private · Engineering prototype",
    role: "Product, research, and implementation",
    monogram: "PR",
    accent: "#6551a6",
    links: [],
  },
  {
    id: "threadroot",
    title: "Threadroot",
    subtitle: "Codex Context Optimizer",
    description:
      "An open-source CLI and MCP server that turns repository work into smaller, evidence-backed Codex runs, records token and event receipts, verifies outcomes, and recommends context improvements from real traces.",
    highlights: [
      "Creates compact task briefs with likely reads, tests, verification commands, and risk notes",
      "Streams Codex JSONL into bounded flight-recorder artifacts and scores tokens-to-green",
      "Published as an installable npm package with typecheck, lint, test, package, and smoke release gates",
    ],
    tech: ["TypeScript", "Node.js", "MCP", "Codex CLI", "Vitest", "Zod"],
    status: "Public · npm v0.3.1",
    role: "Open-source product engineering",
    monogram: "TR",
    accent: "#405974",
    links: [
      { label: "GitHub", href: "https://github.com/Sevan1211/threadroot" },
      { label: "npm", href: "https://www.npmjs.com/package/threadroot" },
    ],
  },
  {
    id: "codelive",
    title: "CodeLive",
    subtitle: "Live Technical Interview Platform",
    description:
      "A collaborative coding-interview platform with a Monaco editor, multi-file workspaces, in-browser transpilation, live preview, role-based access, and a curated problem bank.",
    highlights: [
      "Custom in-browser module system with Sucrase transpilation and double-buffered preview frames",
      "Candidate and interviewer roles backed by Supabase authentication and JWT validation",
      "Code-split Monaco editor and a realistic development workflow in place of a whiteboard",
    ],
    tech: [
      "React",
      "TypeScript",
      "Vite",
      "Node.js",
      "Express",
      "Supabase",
      "Monaco",
    ],
    status: "Public · Team project",
    role: "Collaborative full-stack development",
    monogram: "CL",
    accent: "#2d65a3",
    links: [
      { label: "GitHub", href: "https://github.com/UNO-CSCI4830/CodeLive" },
    ],
  },
] as const satisfies readonly ProjectEntry[];

/* ── Platform stats (System Properties app) ───────────────── */

/**
 * Rounded on purpose. These describe the Rasmussen data platform; exact
 * figures would read as internal dashboard output.
 */
export const PLATFORM_STATS = [
  { label: "dbt models", value: "500+" },
  { label: "Automated data tests", value: "2,000+" },
  { label: "Monitored sources", value: "250+" },
  { label: "Governed metrics", value: "100+" },
  { label: "Source systems integrated", value: "6" },
  { label: "Business coverage", value: "Company-wide" },
] as const;

/* ── About This Site ──────────────────────────────────────── */

/**
 * Copy follows the Google developer documentation style guide: active
 * voice, present tense, sentence-case headings, concrete specifics, no
 * marketing language. Every technical claim here describes code that
 * actually ships; keep this in sync when the architecture changes.
 */
export interface SiteSection {
  id: string;
  title: string;
  body: readonly string[];
}

export const SITE_INFO = {
  intro:
    "This portfolio has two deliberately different interfaces: a playful 3D office and desktop on larger screens, and a mobile-native retro phone on narrower screens. Both lead to the same projects, experience, skills, resume, and contact information.",
  sections: [
    {
      id: "architecture",
      title: "Architecture",
      body: [
        "On desktop, the star-shell loader transitions directly into the 3D office. The operating system is a DOM overlay that fades in when the camera reaches the monitor, so it behaves like a real interface instead of a picture inside the scene.",
        "Because the desktop is real DOM rather than a rendered texture, text stays selectable, links stay links, and the browser handles scrolling and focus natively. While the desktop is open, the demand-based canvas has no reason to render, so reading this page adds no continuous GPU work.",
      ],
    },
    {
      id: "office",
      title: "The 3D office",
      body: [
        "The room uses an optimized glTF model with embedded WebP textures. Its compact assets shorten the handoff from the loading screen without changing the office's intended look.",
        "The star-shell screensaver is mounted directly inside the physical monitor mesh, so it stays animated during a camera drag without a second render pass. The TV synthesizes its own channels on a small canvas texture, the coffee steam is a bounded particle system, and the wanted poster is drawn once onto a canvas.",
      ],
    },
    {
      id: "rendering",
      title: "Rendering on demand",
      body: [
        "The scene renders only when something changes. Camera input is coalesced to one update per animation frame; dragging remains full-rate, while the idle screensaver requests a retro 24 frames per second and the TV updates its program at about 11 frames per second. Both screens continue playing during a drag.",
        "The shadow pass runs once while the room is staged and is then frozen. Shaders compile asynchronously and unique textures upload in idle slices behind the opaque transition veil, and the handoff waits for actual scene readiness instead of a fixed delay.",
      ],
    },
    {
      id: "tiering",
      title: "Scaling to the device",
      body: [
        "At startup the site reads the reported CPU cores and device memory and selects one stable quality tier for pixel ratio, antialiasing, anisotropy, and shadow-map resolution. The tier does not change mid-drag, which avoids visible resolution oscillation while retaining the full-quality target on capable machines.",
      ],
    },
    {
      id: "os",
      title: "The operating system",
      body: [
        "The desktop is a window manager built from scratch. A single reducer owns all window state (position, size, z-order, and minimized and maximized bounds), and every drag, resize, and focus change dispatches an action against it. Each app loads lazily the first time it opens, so the OS shell stays small.",
      ],
    },
    {
      id: "mobile",
      title: "The mobile experience",
      body: [
        "At 1024 pixels and below, the site switches to a mobile-native 2007-era phone interface instead of shrinking the cubicle. About, experience, skills, projects, contact, and resume content are immediately available as accessible apps, with shareable app links and browser Back behavior.",
        "The lock screen appears once per tab, reduced-motion and high-contrast preferences are honored, and its code-native CSS background does not pull the desktop 3D bundle into the phone route. A no-WebGL or keyboard route never depends on completing a drag gesture to reach the core portfolio.",
      ],
    },
    {
      id: "apps",
      title: "The apps",
      body: [
        "The Python IDE runs CPython compiled to WebAssembly (Pyodide) inside a Web Worker, so a runaway loop cannot freeze the page. Packages that a script imports, such as NumPy, install automatically.",
        "Pac-Man’s ghosts change search algorithm as the levels progress: depth-first search, breadth-first search, A*, and then predictive pursuit. Paint is a canvas-based image editor. The terminal reads the same content model as every other surface on the site, so its output can never disagree with the About Me app.",
      ],
    },
  ] satisfies readonly SiteSection[],
  tip: "Try it: run the starter script in the Python IDE, or watch the ghosts change strategy between Pac-Man levels. To return to the office, press Esc or choose Start > Shut Down.",
  /** CC BY 4.0 attribution for the office model (title, author, source, license). */
  modelCredit: {
    prefix: "Office model:",
    title: "Low Poly 90s Office Cubicle",
    sourceUrl:
      "https://sketchfab.com/3d-models/low-poly-90s-office-cubicle-4912ac8a39e546e39524badcca7b240f",
    author: "NobleCrow",
    authorUrl: "https://sketchfab.com/NobleCrow",
    license: "CC BY 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
  },
  stack: [
    "React",
    "TypeScript",
    "Three.js",
    "React Three Fiber",
    "Vite",
    "Pyodide",
  ],
  repo: "https://github.com/Sevan1211/Portfolio",
} as const;
