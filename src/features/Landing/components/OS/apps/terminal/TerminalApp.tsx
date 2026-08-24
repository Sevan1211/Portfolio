import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useDesktop } from '../../core/useDesktop';
import { AppId } from '../../core/types';
import {
  CONTACT,
  EDUCATION,
  EXPERIENCE,
  IDENTITY,
  LANGUAGES,
  PLATFORM_STATS,
  SKILL_GROUPS,
} from '@shared/content/portfolio';
import './styles/index.css';

/* ══════════════════════════════════════════════════════════
   Terminal: an MS-DOS-style prompt for the Win95 OS.

   Light gray on black, C:\SEVAN> prompt, and two command sets:
   portfolio commands that read the shared content model, and DOS
   flavor (DIR, VER, CLS, ECHO, EXIT, and the .EXEs that DIR lists
   actually run). Commands are case-insensitive.
   ══════════════════════════════════════════════════════════ */

interface TerminalLine {
  type: 'command' | 'output' | 'error' | 'banner' | 'heading' | 'dim';
  content: string;
}

const PROMPT = 'C:\\SEVAN>';
const VERSION_LINE = 'Portfolio Terminal [Version 4.95]';

/* ── ASCII banner ───────────────────── */
const BANNER_LINES = [
  '  ____                        ',
  ' / ___|  _____   ____ _ _ __  ',
  ' \\___ \\ / _ \\ \\ / / _` | \'_ \\ ',
  '  ___) |  __/\\ V / (_| | | | |',
  ' |____/ \\___| \\_/ \\__,_|_| |_|',
];

type CmdResult = { type: 'output' | 'error' | 'dim'; content: string };

const OPENABLE: Record<string, AppId> = {
  about: 'about',
  site: 'site',
  terminal: 'terminal',
  pacman: 'pacman',
  'pac-man': 'pacman',
  paint: 'paint',
  python: 'python',
};

/** What DIR lists. Typing a file name runs it. */
const FILES: {
  name: string;
  ext: string;
  size: string;
  desc: string;
  run: { kind: 'app'; appId: AppId } | { kind: 'resume' };
}[] = [
  { name: 'ABOUT', ext: 'EXE', size: '90,112', desc: 'About Me: experience, education, skills', run: { kind: 'app', appId: 'about' } },
  { name: 'SITE', ext: 'EXE', size: '48,640', desc: 'About This Site: how the portfolio works', run: { kind: 'app', appId: 'site' } },
  { name: 'TERMINAL', ext: 'EXE', size: '23,552', desc: 'this window', run: { kind: 'app', appId: 'terminal' } },
  { name: 'PACMAN', ext: 'EXE', size: '71,168', desc: 'four ghost search algorithms', run: { kind: 'app', appId: 'pacman' } },
  { name: 'PAINT', ext: 'EXE', size: '38,912', desc: 'canvas image editor', run: { kind: 'app', appId: 'paint' } },
  { name: 'PYTHON', ext: 'EXE', size: '262,144', desc: 'real Python via WebAssembly', run: { kind: 'app', appId: 'python' } },
  { name: 'RESUME', ext: 'PDF', size: '84,992', desc: 'print-ready resume', run: { kind: 'resume' } },
];

const FILE_COMMANDS: Record<string, (typeof FILES)[number]> = Object.fromEntries(
  FILES.map((file) => [`${file.name.toLowerCase()}.${file.ext.toLowerCase()}`, file]),
);

const pad = (label: string, width = 14) => label.padEnd(width, ' ');

const openResume = () => {
  window.open(CONTACT.resumePath, '_blank', 'noopener,noreferrer');
};

/* ── Pure commands (read the shared content model) ── */
const COMMANDS: Record<string, (args: string[]) => CmdResult> = {
  help: () => ({
    type: 'output',
    content: [
      'Portfolio:',
      `  ${pad('ABOUT')}who I am and what I do`,
      `  ${pad('EXPERIENCE')}where I've worked`,
      `  ${pad('EDUCATION')}degree, honors, coursework`,
      `  ${pad('SKILLS')}what I build with`,
      `  ${pad('PLATFORM')}the data platform at a glance`,
      `  ${pad('CONTACT')}how to reach me`,
      `  ${pad('RESUME')}download my resume (PDF)`,
      `  ${pad('WHOAMI')}the short version`,
      '',
      'System:',
      `  ${pad('DIR')}see what's on this machine`,
      `  ${pad('OPEN <app>')}launch an app (about, site, paint, pacman, python)`,
      `  ${pad('ECHO <text>')}say it back`,
      `  ${pad('VER')}version info`,
      `  ${pad('CLS')}clear the screen`,
      `  ${pad('EXIT')}close this window`,
    ].join('\n'),
  }),

  whoami: () => ({
    type: 'output',
    content: `${IDENTITY.name} - ${IDENTITY.title}. ${IDENTITY.availabilityShort}.`,
  }),

  about: () => ({
    type: 'output',
    content: [
      IDENTITY.name,
      `${IDENTITY.title} - ${IDENTITY.location}`,
      '',
      IDENTITY.narrative,
      '',
      IDENTITY.availability,
    ].join('\n'),
  }),

  experience: () => ({
    type: 'output',
    content: EXPERIENCE.map((entry) =>
      [
        `${entry.company} - ${entry.role}`,
        `${entry.dates} · ${entry.location}`,
        ...entry.summary.map((line) => `  · ${line}`),
      ].join('\n'),
    ).join('\n\n'),
  }),

  education: () => ({
    type: 'output',
    content: [
      EDUCATION.school,
      EDUCATION.degree,
      EDUCATION.minor,
      EDUCATION.graduation,
      '',
      'awards',
      ...EDUCATION.awards.map((award) => `  · ${award.name}`),
      '',
      'coursework',
      ...EDUCATION.coursework.map((course) => `  · ${course}`),
      '',
      'in progress (fall 2026)',
      ...EDUCATION.inProgress.map((course) => `  · ${course}`),
    ].join('\n'),
  }),

  skills: () => ({
    type: 'output',
    content: [
      `${pad('languages', 16)}${LANGUAGES.join(', ')}`,
      '',
      ...SKILL_GROUPS.map(
        (group) => `${pad(group.label.toLowerCase(), 16)}${group.items.join(', ')}`,
      ),
    ].join('\n'),
  }),

  platform: () => ({
    type: 'output',
    content: [
      'Snowflake + dbt data platform (Rasmussen Air and Gas Energy)',
      '',
      ...PLATFORM_STATS.map((stat) => `${pad(stat.value)}${stat.label}`),
    ].join('\n'),
  }),

  contact: () => ({
    type: 'output',
    content: [
      `${pad('email', 10)}${CONTACT.email}`,
      `${pad('github', 10)}${CONTACT.githubLabel}`,
      `${pad('linkedin', 10)}${CONTACT.linkedinLabel}`,
      `${pad('location', 10)}${CONTACT.location}`,
    ].join('\n'),
  }),

  resume: () => {
    openResume();
    return { type: 'output', content: 'Opening RESUME.PDF…' };
  },

  dir: () => ({
    type: 'output',
    content: [
      ' Volume in drive C is PORTFOLIO',
      ` Directory of C:\\SEVAN`,
      '',
      ...FILES.map(
        (file) =>
          `${file.name.padEnd(9)}${file.ext.padEnd(5)}${file.size.padStart(8)}  ${file.desc}`,
      ),
      `${String(FILES.length).padStart(9)} file(s)`,
      '',
      'Run a program by typing its name, e.g. PACMAN.EXE',
    ].join('\n'),
  }),

  ver: () => ({ type: 'output', content: VERSION_LINE }),

  echo: (args) => ({
    type: 'output',
    content: args.length > 0 ? args.join(' ') : 'ECHO is on.',
  }),

  cd: (args) => ({
    type: args.length > 0 ? 'error' : 'output',
    content:
      args.length > 0
        ? 'The system cannot find the path specified.'
        : 'C:\\SEVAN',
  }),
};

const COMPLETABLE = [
  ...Object.keys(COMMANDS),
  'open',
  'cls',
  'clear',
  'exit',
  ...Object.keys(FILE_COMMANDS),
].sort();

const OPEN_TARGETS = Object.keys(OPENABLE).sort();

/* ── Component ──────────────────────── */
export const TerminalApp: React.FC = () => {
  const { windows, openApp, closeWindow } = useDesktop();
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [suggestion, setSuggestion] = useState('');
  const [booted, setBooted] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const openAppRef = useRef(openApp);
  openAppRef.current = openApp;
  const closeSelfRef = useRef(() => {});
  closeSelfRef.current = () => {
    const self = windows.find((win) => win.appId === 'terminal');
    if (self) closeWindow(self.id);
  };

  /* ── Boot: banner types itself in line by line, CRT style ── */
  useEffect(() => {
    if (booted) return;

    const bootSequence: TerminalLine[] = [
      ...BANNER_LINES.map((line): TerminalLine => ({ type: 'banner', content: line })),
      { type: 'output', content: '' },
      { type: 'heading', content: `${IDENTITY.name} - ${IDENTITY.title}` },
      { type: 'dim', content: VERSION_LINE },
      { type: 'output', content: '' },
      { type: 'output', content: 'Type HELP for commands, or DIR to look around.' },
      { type: 'output', content: '' },
    ];

    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    if (reducedMotion) {
      const timer = setTimeout(() => {
        setLines(bootSequence);
        setBooted(true);
      }, 200);
      return () => clearTimeout(timer);
    }

    const timers: number[] = [];
    bootSequence.forEach((line, index) => {
      timers.push(
        window.setTimeout(
          () => {
            setLines((prev) => [...prev, line]);
            if (index === bootSequence.length - 1) setBooted(true);
          },
          200 + index * 55,
        ),
      );
    });

    return () => timers.forEach((timer) => clearTimeout(timer));
  }, [booted]);

  /* ── Auto-scroll ────────────────── */
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [lines]);

  /* ── Tab completion (commands, then OPEN targets) ── */
  const updateSuggestion = useCallback((value: string) => {
    const lower = value.toLowerCase();
    if (!lower) {
      setSuggestion('');
      return;
    }

    const openMatch = /^open\s+(\S*)$/.exec(lower);
    if (openMatch) {
      const partial = openMatch[1] ?? '';
      const target = OPEN_TARGETS.find(
        (name) => name.startsWith(partial) && name !== partial,
      );
      setSuggestion(target ? target.slice(partial.length) : '');
      return;
    }

    const match = COMPLETABLE.find(
      (name) => name.startsWith(lower) && name !== lower,
    );
    setSuggestion(match ? match.slice(value.length) : '');
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setInput(e.target.value);
      updateSuggestion(e.target.value);
    },
    [updateSuggestion],
  );

  /* ── Execute ────────────────────── */
  const executeCommand = useCallback((command: string) => {
    const trimmed = command.trim();
    if (!trimmed) return;

    const commandLine: TerminalLine = {
      type: 'command',
      content: `${PROMPT}${trimmed}`,
    };
    setHistory((prev) => [...prev, trimmed]);
    setHistoryIndex(-1);

    const [rawName, ...args] = trimmed.split(/\s+/);
    if (!rawName) return;
    const name = rawName.toLowerCase();

    if (name === 'clear' || name === 'cls') {
      setLines([]);
      return;
    }

    if (name === 'exit') {
      closeSelfRef.current();
      return;
    }

    if (name === 'open') {
      const target = args[0]?.toLowerCase();
      const appId = target ? OPENABLE[target] : undefined;
      if (!appId) {
        setLines((prev) => [
          ...prev,
          commandLine,
          {
            type: 'error',
            content: target
              ? `open: unknown app '${target}'. Try about, site, paint, pacman, python`
              : 'open: which app? Try about, site, paint, pacman, python',
          },
        ]);
        return;
      }
      openAppRef.current(appId);
      setLines((prev) => [
        ...prev,
        commandLine,
        { type: 'output', content: `Launching ${target}…` },
      ]);
      return;
    }

    /* DIR's files run by name, like real DOS */
    const file = FILE_COMMANDS[name];
    if (file) {
      if (file.run.kind === 'resume') {
        openResume();
        setLines((prev) => [
          ...prev,
          commandLine,
          { type: 'output', content: 'Opening RESUME.PDF…' },
        ]);
      } else {
        openAppRef.current(file.run.appId);
        setLines((prev) => [
          ...prev,
          commandLine,
          { type: 'output', content: `Running ${file.name}.${file.ext}…` },
        ]);
      }
      return;
    }

    const handler = COMMANDS[name];
    if (handler) {
      setLines((prev) => [...prev, commandLine, handler(args)]);
    } else {
      setLines((prev) => [
        ...prev,
        commandLine,
        { type: 'error', content: 'Bad command or file name. Type HELP.' },
      ]);
    }
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      executeCommand(input);
      setInput('');
      setSuggestion('');
    },
    [executeCommand, input],
  );

  /* ── Key handling ───────────────── */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        if (suggestion) {
          setInput(input + suggestion);
          setSuggestion('');
        }
        return;
      }

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

      if (e.key === 'l' && e.ctrlKey) {
        e.preventDefault();
        setLines([]);
      }

      if (e.key === 'c' && e.ctrlKey) {
        e.preventDefault();
        setLines((prev) => [
          ...prev,
          { type: 'command', content: `${PROMPT}${input}^C` },
        ]);
        setInput('');
        setSuggestion('');
      }
    },
    [suggestion, input, history, historyIndex, updateSuggestion],
  );

  /* ── Render ─────────────────────── */
  return (
    <div
      className="app-content terminal-app"
      onClick={() => inputRef.current?.focus()}
    >
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
            <span className="terminal-prompt">{PROMPT}</span>
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
                aria-label="Terminal input"
              />
              {suggestion && (
                <span className="terminal-suggestion">
                  {input}
                  {suggestion}
                </span>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
