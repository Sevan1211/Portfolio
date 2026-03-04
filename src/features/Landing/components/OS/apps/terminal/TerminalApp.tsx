import React, { useState, useRef, useEffect, useCallback } from 'react';
import './styles/index.css';

/* ── Types ──────────────────────────── */
interface TerminalLine {
  type: 'command' | 'output' | 'error';
  content: string;
}

/* ── ASCII banner ───────────────────── */
const BANNER = [
  '  ____                        ',
  ' / ___|  _____   ____ _ _ __  ',
  ' \\___ \\ / _ \\ \\ / / _` | \'_ \\ ',
  '  ___) |  __/\\ V / (_| | | | |',
  ' |____/ \\___| \\_/ \\__,_|_| |_|',
].join('\n');

/* ── Commands ───────────────────────── */
const COMMAND_NAMES = [
  'help', 'about', 'skills', 'experience', 'projects',
  'contact', 'clear',
] as const;

type CmdResult = { type: 'output' | 'error'; content: string };

function buildCommands(): Record<string, (args: string[]) => CmdResult> {

  return {
    help: () => ({
      type: 'output',
      content: [
        'about       about me',
        'skills      languages, frameworks, tools',
        'experience  work history',
        'projects    featured projects',
        'contact     get in touch',
        'clear       clear screen',
      ].join('\n'),
    }),

    about: () => ({
      type: 'output',
      content: [
        'Sevan Lewis-Payne',
        'Full-Stack Developer — Omaha, NE',
        '',
        'CS & AI @ University of Nebraska Omaha (May 2027)',
        'Buffett Scholar (Full Ride)',
        'Rising Star Intern Award, Fall 2025',
      ].join('\n'),
    }),

    skills: () => ({
      type: 'output',
      content: [
        'languages   python, java, kotlin, javascript, c, go, sql',
        'frameworks  react, node, tailwind, spring boot, three.js',
        'tools       git, docker, linux, power bi, snowflake, dbt',
      ].join('\n'),
    }),

    experience: () => ({
      type: 'output',
      content: [
        'Rasmussen Air and Gas Energy — Data Viz & Automation Intern',
        'Aug 2025 – Present, Omaha NE',
        '  Power BI dashboards, Snowflake data models, n8n pipelines',
        '',
        'First National Bank — Software Engineer Intern',
        'May 2024 – Aug 2025, Omaha NE',
        '  React migration, REST APIs, Jest tests, features for 100K+ users',
        '',
        'University of Nebraska Omaha — IT Operations Specialist',
        'Aug 2025 – Present, Omaha NE',
        '  Tech support for faculty/students, device setup & troubleshooting',
      ].join('\n'),
    }),

    projects: () => ({
      type: 'output',
      content: [
        'PrepMe — Interactive Coding & Learning Platform',
        '  react, typescript, go, python, fastapi, docker',
        '  github.com/Sevan1211/PrepMe',
        '',
        'CodeLive — Live Technical Interview Platform',
        '  react, typescript, node.js, express, supabase',
        '  github.com/UNO-CSCI4830/CodeLive',
        '',
        'Elmwood Exteriors — Professional Business Website',
        '  react, javascript, css3, emailjs',
        '  github.com/Sevan1211/Elmwood-Exterior-Website',
        '',
        '3D Portfolio — This site',
        '  react, typescript, three.js, vite',
      ].join('\n'),
    }),

    contact: () => ({
      type: 'output',
      content: [
        'email     slewis-payne@unomaha.edu',
        'github    github.com/Sevan1211',
        'linkedin  linkedin.com/in/sevan-lewis-payne',
      ].join('\n'),
    }),

    clear: () => ({ type: 'output', content: 'CLEAR' }),
  };
}

/* ── Component ──────────────────────── */
export const TerminalApp: React.FC = () => {
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [suggestion, setSuggestion] = useState('');
  const [booted, setBooted] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  /* ── Boot ────────────────────────── */
  useEffect(() => {
    if (booted) return;

    const timer = setTimeout(() => {
      setLines([
        { type: 'output', content: BANNER },
        { type: 'output', content: '' },
        { type: 'output', content: "type 'help' for commands" },
        { type: 'output', content: '' },
      ]);
      setBooted(true);
    }, 400);

    return () => clearTimeout(timer);
  }, [booted]);

  /* ── Auto-scroll ────────────────── */
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [lines]);

  /* ── Tab completion ─────────────── */
  const updateSuggestion = useCallback((value: string) => {
    if (!value) { setSuggestion(''); return; }
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

    const commandLine: TerminalLine = { type: 'command', content: `~ $ ${trimmed}` };
    setHistory(prev => [...prev, trimmed]);
    setHistoryIndex(-1);

    const parts = trimmed.split(/\s+/);
    const [commandName, ...args] = parts;
    if (!commandName) return;

    const cmd = commandName.toLowerCase();

    if (cmd === 'clear') { setLines([]); return; }

    const commands = buildCommands();
    if (commands[cmd]) {
      const result = commands[cmd](args);
      setLines(prev => [...prev, commandLine, result]);
    } else {
      setLines(prev => [
        ...prev,
        commandLine,
        { type: 'error', content: `${cmd}: command not found` },
      ]);
    }
  }, []);

  /* ── Form submit ────────────────── */
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    executeCommand(input);
    setInput('');
    setSuggestion('');
  }, [executeCommand, input]);

  /* ── Key handling ───────────────── */
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      if (suggestion) {
        const completed = input + suggestion;
        setInput(completed);
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
      setLines(prev => [
        ...prev,
        { type: 'command', content: `~ $ ${input}^C` },
      ]);
      setInput('');
      setSuggestion('');
    }
  }, [suggestion, input, history, historyIndex, updateSuggestion]);

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
            <span className="terminal-prompt">~ $</span>
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
