import React, { useState, useRef, useEffect, useCallback } from 'react';
import './styles/index.css';

/* ══════════════════════════════════════════════════════════
   Types
   ══════════════════════════════════════════════════════════ */
type ThemeName = 'green' | 'amber' | 'blue' | 'white' | 'pink';

interface TerminalLine {
  type: 'command' | 'output' | 'error';
  content: string;
}

/* ══════════════════════════════════════════════════════════
   Theme colors
   ══════════════════════════════════════════════════════════ */
const THEMES: Record<ThemeName, { fg: string; prompt: string; accent: string; label: string }> = {
  green:  { fg: '#0f0',    prompt: '#0f0',    accent: '#0a0',   label: 'Matrix Green' },
  amber:  { fg: '#ffb000', prompt: '#ffb000', accent: '#cc8e00', label: 'Amber CRT' },
  blue:   { fg: '#00bfff', prompt: '#00bfff', accent: '#0088b3', label: 'Ice Blue' },
  white:  { fg: '#d4d4d4', prompt: '#d4d4d4', accent: '#999',    label: 'Classic White' },
  pink:   { fg: '#ff79c6', prompt: '#ff79c6', accent: '#ff55b8', label: 'Cyberpink' },
};

/* ══════════════════════════════════════════════════════════
   ASCII banner
   ══════════════════════════════════════════════════════════ */
const BANNER = `
 ███████╗███████╗██╗   ██╗ █████╗ ███╗   ██╗
 ██╔════╝██╔════╝██║   ██║██╔══██╗████╗  ██║
 ███████╗█████╗  ██║   ██║███████║██╔██╗ ██║
 ╚════██║██╔══╝  ╚██╗ ██╔╝██╔══██║██║╚██╗██║
 ███████║███████╗ ╚████╔╝ ██║  ██║██║ ╚████║
 ╚══════╝╚══════╝  ╚═══╝  ╚═╝  ╚═╝╚═╝  ╚═══╝
`.trimStart();

/* ══════════════════════════════════════════════════════════
   Command definitions
   ══════════════════════════════════════════════════════════ */
const COMMAND_NAMES = [
  'help', 'about', 'skills', 'experience', 'projects',
  'contact', 'social', 'neofetch', 'theme', 'banner',
  'whoami', 'date', 'echo', 'history', 'clear', 'secret',
] as const;

type CmdResult = { type: 'output' | 'error'; content: string };

function buildCommands(
  themeName: ThemeName,
  commandHistory: string[],
): Record<string, (args: string[]) => CmdResult> {
  const c = THEMES[themeName];

  return {
    help: () => ({
      type: 'output',
      content: [
        'Available commands:',
        '',
        '  help          Show this help message',
        '  about         Who is Sevan?',
        '  skills        Languages, frameworks & tools',
        '  experience    Work history & accomplishments',
        '  projects      Featured projects',
        '  contact       Get in touch',
        '  social        Social links',
        '  neofetch      System info',
        '  theme <name>  Change color theme (green|amber|blue|white|pink)',
        '  banner        Show the welcome banner',
        '  whoami        Display current user',
        '  date          Show current date/time',
        '  echo <text>   Echo text back',
        '  history       Show command history',
        '  clear         Clear the terminal',
      ].join('\n'),
    }),

    about: () => ({
      type: 'output',
      content: [
        'ABOUT',
        '',
        '  Name     : Sevan Lewis-Payne',
        '  Role     : Full-Stack Developer & Problem Solver',
        '  Based    : Omaha, NE',
        '  School   : University of Nebraska Omaha',
        '  Major    : Computer Science & Artificial Intelligence',
        '  Grad     : May 2027',
        '',
        '  Analytical problem solver who breaks challenges down',
        '  to their core and builds toward the best solution.',
        '  Started programming LEGO robots as a kid, took every',
        '  tech class in high school, and never looked back.',
        '',
        '  Awards   : Rising Star Intern Award (Fall 2025)',
        '             Buffett Scholarship (Full Ride)',
        '',
        '  Motto    : Carpe Diem. Seize the day.',
      ].join('\n'),
    }),

    skills: () => ({
      type: 'output',
      content: [
        'SKILLS',
        '',
        '  languages  : python, java, kotlin, javascript, c, go, sql,',
        '               html, css, mssql, postgresql',
        '',
        '  frameworks : react.js, node.js, tailwind-css, spring-boot,',
        '               rest-api, azure, maven, three.js',
        '',
        '  tools      : git, docker, servicenow, npm, linux,',
        '               power-bi, dbt, snowflake',
      ].join('\n'),
    }),

    experience: () => ({
      type: 'output',
      content: [
        'EXPERIENCE',
        '',
        '  Rasmussen Air and Gas Energy',
        '  -- Data Visualization & Automation Intern',
        '     Aug 2025 - Present | Omaha, NE',
        '     - Built Power BI dashboards + Snowflake data models (+40% reporting efficiency)',
        '     - Automated data pipelines in n8n (saved 20+ hrs/month)',
        '     - Python data analysis (Pandas, NumPy) for cleaner insights',
        '',
        '  First National Bank',
        '  -- Software Engineer Summer Intern',
        '     May 2024 - Aug 2025 | Omaha, NE',
        '     - Modernized legacy HTML to responsive React.js + ADA compliance',
        '     - Agile team of 7: ServiceNow, GitLab, sprints',
        '     - Jest tests, REST APIs via Docker, presented to CTO',
        '     - Features reached 100K+ users, +20% team capacity',
        '',
        '  University of Nebraska Omaha',
        '  -- IT Operations Specialist',
        '     Aug 2025 - Present | Omaha, NE',
        '     - Tech support for faculty/students (hardware, software, A/V)',
        '     - Device setup, troubleshooting across Windows & macOS',
      ].join('\n'),
    }),

    projects: () => ({
      type: 'output',
      content: [
        'PROJECTS',
        '',
        '  [0] PrepMe',
        '      Interactive Coding & Learning Platform',
        '      Full-stack platform with 170+ coding challenges, cloud',
        '      sandbox (Docker), AI tutor, and multi-language execution.',
        '      stack : react, typescript, go, python, fastapi, docker',
        '      repo  : github.com/Sevan1211/PrepMe',
        '',
        '  [1] CodeLive',
        '      Live Technical Interview Platform',
        '      Real-time collaborative coding interview tool with Monaco',
        '      editor, in-browser transpilation, and 250+ problems.',
        '      stack : react, typescript, node.js, express, supabase',
        '      repo  : github.com/UNO-CSCI4830/CodeLive',
        '',
        '  [2] Elmwood Exteriors',
        '      Professional Business Website',
        '      Responsive business site with project gallery, lightbox,',
        '      and EmailJS-powered contact/estimate forms.',
        '      stack : react, javascript, css3, emailjs',
        '      repo  : github.com/Sevan1211/Elmwood-Exterior-Website',
        '',
        '  [3] 3D Portfolio',
        '      This Interactive Portfolio',
        '      Retro OS rendered inside a 3D scene with React Three',
        '      Fiber. Features windowed apps, Pac-Man, and this terminal.',
        '      stack : react, typescript, three.js, vite',
        '',
        "  Run 'contact' for links or visit github.com/Sevan1211",
      ].join('\n'),
    }),

    contact: () => ({
      type: 'output',
      content: [
        'CONTACT',
        '',
        '  school   : slewis-payne@unomaha.edu',
        '  personal : sevan1211@icloud.com',
        '  github   : github.com/Sevan1211',
        '  linkedin : linkedin.com/in/sevan-lewis-payne',
        '  location : Omaha, NE',
        '',
        '  Always open to new opportunities and collaborations.',
      ].join('\n'),
    }),

    social: () => ({
      type: 'output',
      content: [
        'SOCIAL',
        '',
        '  github   : github.com/Sevan1211',
        '  linkedin : linkedin.com/in/sevan-lewis-payne',
      ].join('\n'),
    }),

    neofetch: () => {
      const now = new Date();
      const uptime = `${Math.floor(Math.random() * 30) + 1}d ${Math.floor(Math.random() * 24)}h ${Math.floor(Math.random() * 60)}m`;
      return {
        type: 'output' as const,
        content: [
          '  guest@sevan-os',
          '  --------------',
          '  OS       : Sevan OS v1.0',
          '  Host     : 3D Portfolio',
          '  Kernel   : React 18 + Vite 7',
          `  Uptime   : ${uptime}`,
          '  Shell    : sevan-term 1.0',
          '  DE       : Retro Desktop',
          `  Theme    : ${c.label}`,
          '  CPU      : TypeScript 5.9 Engine',
          '  Memory   : 256 MB / 512 MB',
          `  Date     : ${now.toLocaleDateString()}`,
        ].join('\n'),
      };
    },

    theme: (args: string[]) => {
      const name = args[0]?.toLowerCase();
      if (!name || !(name in THEMES)) {
        return {
          type: 'output',
          content: `Usage: theme <${Object.keys(THEMES).join('|')}>\nCurrent theme: ${themeName}`,
        };
      }
      return {
        type: 'output',
        content: `theme: set to '${name}'`,
      };
    },

    banner: () => ({
      type: 'output',
      content: `${BANNER}\n  Welcome to Sevan's Terminal -- type 'help' to get started.`,
    }),

    whoami: () => ({
      type: 'output',
      content: 'guest@sevan-os',
    }),

    date: () => ({
      type: 'output',
      content: new Date().toString(),
    }),

    echo: (args: string[]) => ({
      type: 'output',
      content: args.join(' '),
    }),

    history: () => ({
      type: 'output',
      content: commandHistory.length === 0
        ? 'No commands in history.'
        : commandHistory.map((cmd, i) =>
            `${String(i + 1).padStart(4)}  ${cmd}`
          ).join('\n'),
    }),

    clear: () => ({ type: 'output', content: 'CLEAR' }),

    secret: () => ({
      type: 'output',
      content: [
        '-- you found something --',
        '',
        '  thanks for exploring the terminal.',
        '  fun fact: this entire OS is rendered',
        '  inside a 3D scene using react-three-fiber.',
        '',
        '  >> achievement unlocked: curious mind',
      ].join('\n'),
    }),
  };
}

/* ══════════════════════════════════════════════════════════
   Component
   ══════════════════════════════════════════════════════════ */
export const TerminalApp: React.FC = () => {
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [theme, setTheme] = useState<ThemeName>('green');
  const [suggestion, setSuggestion] = useState('');
  const [booted, setBooted] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const bootLinesRef = useRef<TerminalLine[]>([]);

  const themeColors = THEMES[theme];

  /* ── Boot sequence ─────────────────── */
  useEffect(() => {
    if (booted) return;

    const bootMessages = [
      { delay: 0,    text: 'Initializing Sevan OS v1.0...' },
      { delay: 300,  text: 'Loading kernel modules... ██████████ OK' },
      { delay: 600,  text: 'Mounting file systems...   ██████████ OK' },
      { delay: 900,  text: 'Starting network...        ██████████ OK' },
      { delay: 1200, text: 'Loading terminal...        ██████████ OK' },
      { delay: 1500, text: '' },
    ];

    const timers: ReturnType<typeof setTimeout>[] = [];

    bootMessages.forEach(({ delay, text }) => {
      timers.push(setTimeout(() => {
        const line: TerminalLine = { type: 'output', content: text };
        bootLinesRef.current = [...bootLinesRef.current, line];
        setLines([...bootLinesRef.current]);
      }, delay));
    });

    // After boot, show banner
    timers.push(setTimeout(() => {
      const bannerLine: TerminalLine = {
        type: 'output',
        content: `${BANNER}\n  Welcome to Sevan's Terminal -- type 'help' to get started.`,
      };
      bootLinesRef.current = [...bootLinesRef.current, bannerLine, { type: 'output', content: '' }];
      setLines([...bootLinesRef.current]);
      setBooted(true);
    }, 1800));

    return () => timers.forEach(clearTimeout);
  }, [booted]);

  /* ── Auto-scroll ────────────────── */
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [lines]);

  /* ── Tab completion & suggestions ── */
  const updateSuggestion = useCallback((value: string) => {
    if (!value) {
      setSuggestion('');
      return;
    }
    const match = COMMAND_NAMES.find(c => c.startsWith(value.toLowerCase()) && c !== value.toLowerCase());
    setSuggestion(match ? match.slice(value.length) : '');
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInput(val);
    updateSuggestion(val);
  }, [updateSuggestion]);

  /* ── Execute command ────────────── */
  const executeCommand = useCallback((command: string) => {
    const trimmed = command.trim();
    if (!trimmed) return;

    const commandLine: TerminalLine = { type: 'command', content: `guest@sevan-os:~$ ${trimmed}` };
    setHistory(prev => [...prev, trimmed]);
    setHistoryIndex(-1);

    const parts = trimmed.split(/\s+/);
    const [commandName, ...args] = parts;
    if (!commandName) return;

    const cmd = commandName.toLowerCase();

    if (cmd === 'clear') {
      setLines([]);
      return;
    }

    // Handle theme change
    if (cmd === 'theme' && args[0] && args[0].toLowerCase() in THEMES) {
      setTheme(args[0].toLowerCase() as ThemeName);
    }

    const commands = buildCommands(theme, history);
    if (commands[cmd]) {
      const result = commands[cmd](args);
      setLines(prev => [...prev, commandLine, result]);
    } else {
      setLines(prev => [
        ...prev,
        commandLine,
        {
          type: 'error',
          content: `Command not found: ${cmd}. Type "help" for available commands.`,
        },
      ]);
    }
  }, [theme, history]);

  /* ── Form submit ────────────────── */
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    executeCommand(input);
    setInput('');
    setSuggestion('');
  }, [executeCommand, input]);

  /* ── Key handling ───────────────── */
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Tab completion
    if (e.key === 'Tab') {
      e.preventDefault();
      if (suggestion) {
        const completed = input + suggestion;
        setInput(completed);
        setSuggestion('');
      }
      return;
    }

    // History navigation
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length > 0) {
        const newIndex = historyIndex + 1;
        if (newIndex < history.length) {
          setHistoryIndex(newIndex);
          const cmd = history[history.length - 1 - newIndex] ?? '';
          setInput(cmd);
          updateSuggestion(cmd);
        }
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        const cmd = history[history.length - 1 - newIndex] ?? '';
        setInput(cmd);
        updateSuggestion(cmd);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput('');
        setSuggestion('');
      }
    }

    // Ctrl+L to clear
    if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      setLines([]);
    }

    // Ctrl+C to cancel
    if (e.key === 'c' && e.ctrlKey) {
      e.preventDefault();
      setLines(prev => [
        ...prev,
        { type: 'command', content: `guest@sevan-os:~$ ${input}^C` },
      ]);
      setInput('');
      setSuggestion('');
    }
  }, [suggestion, input, history, historyIndex, updateSuggestion]);

  /* ── Render ─────────────────────── */
  const termStyle = {
    '--term-fg': themeColors.fg,
    '--term-prompt': themeColors.prompt,
    '--term-accent': themeColors.accent,
  } as React.CSSProperties;

  return (
    <div
      className="app-content terminal-app"
      style={termStyle}
      onClick={() => inputRef.current?.focus()}
    >
      {/* CRT scanline overlay */}
      <div className="terminal-scanlines" />

      <div className="terminal-content" ref={contentRef}>
        {lines.map((line, i) => (
          <div key={i} className={`terminal-line terminal-line--${line.type}`}>
            {line.content.split('\n').map((text, j) => (
              <div key={j}>{text || '\u00A0'}</div>
            ))}
          </div>
        ))}

        {booted && (
          <form onSubmit={handleSubmit} className="terminal-input-line">
            <span className="terminal-prompt">guest@sevan-os:~$</span>
            <div className="terminal-input-wrapper">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                className="terminal-input"
                autoFocus
                spellCheck={false}
                autoComplete="off"
                autoCapitalize="off"
              />
              {suggestion && (
                <span className="terminal-suggestion">{input}{suggestion}</span>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
