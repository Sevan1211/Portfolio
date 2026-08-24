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

/* ── Identity ─────────────────────────────────────────────── */

export const IDENTITY = {
  name: 'Sevan Lewis-Payne',
  /** One-line role identity. Used in metadata and headers. */
  title: 'Data & Software Engineer',
  tagline: 'Data Platforms · Backend Systems · AI Infrastructure',
  /** The primary narrative. Systems-oriented, not "passionate developer". */
  narrative:
    'Data and software engineer building governed data platforms, secure production applications, and AI-enabled developer tools.',
  availability:
    'Graduating May 2027 and available full-time. Focused on data platform, backend, and AI infrastructure engineering.',
  availabilityShort: 'Available May 2027',
  location: 'Omaha, NE',
  locationNote: 'Omaha, NE (Open to Relocation)',
} as const;

/* ── Contact ──────────────────────────────────────────────── */

export const CONTACT = {
  email: 'slewis-payne@unomaha.edu',
  github: 'https://github.com/Sevan1211',
  githubLabel: 'github.com/Sevan1211',
  linkedin: 'https://www.linkedin.com/in/sevan-lewis-payne',
  linkedinLabel: 'linkedin.com/in/sevan-lewis-payne',
  resumePath: '/resume/Sevan-Lewis-Payne-2026-Resume.pdf',
  location: 'Omaha, NE (Open to Relocation)',
} as const;

/* ── About ────────────────────────────────────────────────── */

export const ABOUT = {
  heading: 'About Me',
  /** Professional framing first; this is what a recruiter reads. */
  intro: [
    "I'm a Computer Science and Artificial Intelligence student at the University of Nebraska Omaha, and I work where data engineering and software engineering meet.",
    'My work has centered on turning fragmented systems into things that are governed, tested, and actually usable: rebuilding an enterprise data platform, integrating production source systems, implementing quality and CI/CD controls, and shipping secure production software.',
  ],
  /** The human part. Specific rather than generic. */
  personal: [
    'My journey into tech started early. I was programming LEGO robots as a kid, and in high school I took every tech class I could find: AP Computer Science, Information Security, Game Programming, and Robotics. That is when I knew technology was my future.',
    "When I'm not writing code, you'll find me on the golf course, gaming with friends, or traveling. I've been lucky enough to visit multiple countries and I'm always planning the next trip.",
  ],
  philosophy:
    'I care about the parts of engineering that make systems trustworthy: clear ownership, explicit contracts, data quality, testing, observability, secure defaults, and honest failure states.',
} as const;

/* ── Experience ───────────────────────────────────────────── */

export const EXPERIENCE: ExperienceEntry[] = [
  {
    id: 'rasmussen',
    company: 'Rasmussen Air and Gas Energy',
    role: 'Data Engineering and Analytics Intern',
    dates: 'August 2025 to Present',
    location: 'Omaha, NE',
    bullets: [
      'Primary architect and implementer of a governed Snowflake and dbt data platform, rebuilt from the ground up around a bronze/silver/gold medallion architecture with a semantic metrics layer for governed analytics.',
      'Integrated six production source systems (ERP/field-service, CRM, advertising, inspection, telephony, and a legacy platform) through managed ingestion, owning schema-change response and downstream remodeling so upstream changes never silently broke analytics.',
      'Built a data-quality framework of 2,000+ automated tests spanning not-null and uniqueness constraints, referential integrity, accepted values, numeric ranges, compound keys, and custom business-rule checks, with freshness monitoring across 250+ sources.',
      'Implemented PR-gated CI/CD with isolated per-developer environments, test-and-build jobs into a validation environment, and production execution guards preventing unapproved builds against test or production.',
      'Designed tiered, lineage-aware execution so dashboard-critical models and their upstream dependencies build on a separate track from standard, weekly, and on-demand workloads.',
      'Administer Snowflake compute: SQL query optimization, warehouse sizing, and synchronization tuning to keep platform cost under control.',
      'Delivered governed data products used company-wide across finance, sales, operations, and executive reporting, translating business requirements into modeled, tested data rather than one-off queries.',
      'Built internal operations tooling in TypeScript and PostgreSQL to centralize asset records and maintenance workflows, replacing spreadsheet-based tracking.',
    ],
    summary: [
      'Rebuilt an enterprise Snowflake + dbt platform on a medallion architecture with a semantic metrics layer',
      'Integrated six production source systems with owned schema-change response',
      '2,000+ automated data-quality tests · 250+ freshness-monitored sources',
      'PR-gated CI/CD with isolated dev environments and production guards',
      'Snowflake administration and compute cost governance',
    ],
    tech: [
      'Snowflake',
      'dbt',
      'Fivetran',
      'SQL',
      'Python',
      'Metabase',
      'Power BI',
      'CI/CD',
      'TypeScript',
      'PostgreSQL',
    ],
  },
  {
    id: 'fnbo',
    company: 'First National Bank of Omaha',
    role: 'Software Engineering Intern',
    dates: 'Summers 2024 & 2025',
    location: 'Omaha, NE',
    bullets: [
      "Led application-security remediation on a production commercial-card platform, resolving Snyk-identified vulnerabilities across the codebase and dependency tree, with fixes validated before release.",
      'Built React and TypeScript administrative workflows with personally implemented API integrations, enabling account administrators to manage users and credit limits.',
      'Improved ADA accessibility across production workflows through accessible UI patterns and ARIA labeling, validated through the team’s automated QA process.',
      'Authored Jest tests covering user interactions, form submissions, data validation, React components, utilities, and API flows in Docker-based development environments.',
      'Delivered production features on a seven-member agile team using GitLab and ServiceNow for sprint planning, code review, and standups, and presented completed work to the CTO and stakeholders.',
      'Contributed to a platform serving over 100,000 customers.',
    ],
    summary: [
      'Application-security remediation across a production commercial-card platform',
      'React + TypeScript admin workflows with hand-built API integrations',
      'ADA accessibility work validated through automated QA',
      'Jest coverage for interactions, validation, components, and API flows',
      'Seven-member agile team; demoed features to the CTO',
    ],
    tech: [
      'React',
      'TypeScript',
      'JavaScript',
      'Kotlin',
      'Jest',
      'Snyk',
      'Docker',
      'GitLab',
      'ServiceNow',
    ],
  },
  {
    id: 'uno-it',
    company: 'University of Nebraska Omaha',
    role: 'IT Operations Specialist',
    dates: 'August 2025 to Present',
    location: 'Omaha, NE',
    bullets: [
      'Provide technical support to faculty and students, diagnosing and resolving hardware, software, and connectivity issues.',
      'Troubleshoot and maintain classroom technology including projectors, displays, and audiovisual systems.',
      'Handle device setup, configuration, and hardware repairs across Windows and macOS environments.',
      'Communicate technical solutions clearly to users with varying levels of technical experience.',
    ],
    summary: [
      'Technical support for faculty and students across hardware, software, and A/V',
      'Device setup and troubleshooting on Windows and macOS',
    ],
    tech: ['Windows', 'macOS', 'Hardware', 'A/V Systems'],
  },
];

/* ── Education ────────────────────────────────────────────── */

export const EDUCATION = {
  school: 'University of Nebraska Omaha',
  schoolShort: 'UNO',
  degree: 'B.S. in Computer Science and Artificial Intelligence',
  /** Compact display form for tight layouts (profile card, mobile). */
  degreeShort: 'B.S. Computer Science & AI',
  minor: 'Minor in Communication Studies',
  graduation: 'Expected May 2027',
  location: 'Omaha, NE',
  awards: [
    {
      name: 'Rising Star Intern Award',
      detail:
        'University of Nebraska Omaha, 2025. Recognized for performing on par with full-time engineers during my internship at First National Bank of Omaha.',
    },
    {
      name: 'Susan T. Buffett Scholarship',
      detail:
        'Full-ride scholarship covering tuition, room, board, and more through graduation.',
    },
  ],
  /** Completed. Verified against the official record. */
  coursework: [
    'Data Structures',
    'Introduction to Algorithms',
    'Database Management Systems',
    'Software Engineering',
    'Operating Systems',
    'Communication Networks',
    'Artificial Intelligence',
    'Principles of Programming Languages',
    'Theory of Computation',
    'Applied Statistics',
  ],
  /** Currently enrolled; never described as completed. */
  inProgress: [
    'Data Warehousing & Data Mining',
    'Secure System Design',
    'Computer Architecture',
    'AI Concepts',
  ],
} as const;

/* ── Skills ───────────────────────────────────────────────── */

export const SKILL_GROUPS: SkillGroup[] = [
  {
    id: 'data',
    label: 'Data Platforms',
    blurb: 'Warehouse architecture, modeling, and data quality at production scale.',
    items: [
      'Snowflake',
      'dbt',
      'Fivetran',
      'Medallion architecture',
      'Dimensional modeling',
      'Semantic layers',
      'Data-quality testing',
      'Source freshness',
      'Schema-drift handling',
      'Metabase',
      'Power BI',
      'PostgreSQL',
      'SQL Server',
    ],
  },
  {
    id: 'backend',
    label: 'Backend & APIs',
    blurb: 'Services, APIs, and the state behind them.',
    items: [
      'Go',
      'Python',
      'FastAPI',
      'Node.js',
      'REST APIs',
      'WebSockets',
      'Redis',
      'Multi-service architecture',
    ],
  },
  {
    id: 'frontend',
    label: 'Frontend & Product',
    blurb: 'Interfaces that are accessible and hold up in production.',
    items: [
      'React',
      'TypeScript',
      'Next.js',
      'Three.js',
      'Tailwind CSS',
      'Accessible UI / ARIA',
    ],
  },
  {
    id: 'infra',
    label: 'Infrastructure & Delivery',
    blurb: 'Getting things shipped, repeatably.',
    items: [
      'Docker',
      'CI/CD',
      'GitHub Actions',
      'Git',
      'GitLab',
      'Linux',
      'Azure VMs',
      'Azure Functions',
      'Azure API Management',
      'Azure Key Vault',
      'Azure Blob Storage',
      'Microsoft Entra ID',
    ],
  },
  {
    id: 'security',
    label: 'Security & Quality',
    blurb: 'Making systems trustworthy and keeping them that way.',
    items: [
      'Snyk',
      'Jest',
      'OAuth 2.0',
      'Secure code execution',
      'Environment isolation',
      'Production guards',
      'Automated testing',
    ],
  },
  {
    id: 'ai',
    label: 'AI & Automation',
    blurb: 'LLM-backed workflows and the plumbing that makes them reliable.',
    items: [
      'LLM integration',
      'AI-assisted workflows',
      'Structured model outputs',
      'Queue-based processing',
      'Scheduled workflows',
      'Idempotent pipelines',
    ],
  },
];

export const LANGUAGES = [
  'Python',
  'SQL',
  'TypeScript',
  'JavaScript',
  'Go',
  'Kotlin',
  'Java',
  'C',
] as const;

/* ── Platform stats (System Properties app) ───────────────── */

/**
 * Rounded on purpose. These describe the Rasmussen data platform; exact
 * figures would read as internal dashboard output.
 */
export const PLATFORM_STATS = [
  { label: 'dbt models', value: '500+' },
  { label: 'Automated data tests', value: '2,000+' },
  { label: 'Monitored sources', value: '250+' },
  { label: 'Governed metrics', value: '100+' },
  { label: 'Source systems integrated', value: '6' },
  { label: 'Business coverage', value: 'Company-wide' },
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
    'This portfolio is a 3D office that runs in the browser. The room, the monitor, and the desktop you are using right now all render client-side from a single React application. This page explains how it works.',
  sections: [
    {
      id: 'architecture',
      title: 'Architecture',
      body: [
        'The application has two surfaces. A WebGL canvas renders the office through React Three Fiber, and the desktop runs as a separate DOM overlay that fades in when the camera reaches the monitor.',
        'Because the desktop is real DOM rather than a rendered texture, text stays selectable, links stay links, and the browser handles scrolling and focus natively. While the desktop is open, the 3D scene stops rendering entirely, so reading this page costs no GPU time.',
      ],
    },
    {
      id: 'office',
      title: 'The 3D office',
      body: [
        'The room is a glTF model. The set dressing around it is generated at runtime rather than shipped as media: the monitor screensaver renders to an offscreen texture, the TV synthesizes its own channels, the coffee steam is a small particle system, and the wanted poster is drawn onto a canvas.',
      ],
    },
    {
      id: 'rendering',
      title: 'Rendering on demand',
      body: [
        'The scene renders a frame only when something changes. Camera motion and pointer input queue frames explicitly, and an idle room throttles itself to a low frame rate.',
        'The shadow pass runs once while the room is staged and is then frozen: the lights never move, so recomputing shadows every frame would be wasted work. Shaders compile during the loading sequence, behind the opaque transition veil, so the first camera drag never stalls on compilation.',
      ],
    },
    {
      id: 'tiering',
      title: 'Scaling to the device',
      body: [
        'At startup the site reads the reported CPU cores and device memory and picks a quality tier: a pixel-ratio cap, antialiasing, and shadow-map resolution. If frame times drop at runtime, resolution steps down before smoothness does. The same scene stays responsive on low-end hardware without lowering the target for capable machines.',
      ],
    },
    {
      id: 'os',
      title: 'The operating system',
      body: [
        'The desktop is a window manager built from scratch. A single reducer owns all window state (position, size, z-order, and minimized and maximized bounds), and every drag, resize, and focus change dispatches an action against it. Each app loads lazily the first time it opens, so the OS shell stays small.',
      ],
    },
    {
      id: 'apps',
      title: 'The apps',
      body: [
        'The Python IDE runs CPython compiled to WebAssembly (Pyodide) inside a Web Worker, so a runaway loop cannot freeze the page. Packages that a script imports, such as NumPy, install automatically.',
        'Pac-Man’s ghosts change search algorithm as the levels progress: depth-first search, breadth-first search, A*, and then predictive pursuit. Paint is a canvas-based image editor. The terminal reads the same content model as every other surface on the site, so its output can never disagree with the About Me app.',
      ],
    },
  ] satisfies readonly SiteSection[],
  tip: 'Try it: run the starter script in the Python IDE, or watch the ghosts change strategy between Pac-Man levels. To return to the office, press Esc or choose Start > Shut Down.',
  /** CC BY 4.0 attribution for the office model (title, author, source, license). */
  modelCredit: {
    prefix: 'Office model:',
    title: 'Low Poly 90s Office Cubicle',
    sourceUrl:
      'https://sketchfab.com/3d-models/low-poly-90s-office-cubicle-4912ac8a39e546e39524badcca7b240f',
    author: 'NobleCrow',
    authorUrl: 'https://sketchfab.com/NobleCrow',
    license: 'CC BY 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
  },
  stack: ['React', 'TypeScript', 'Three.js', 'React Three Fiber', 'Vite', 'Pyodide'],
  repo: 'https://github.com/Sevan1211/Portfolio',
} as const;
