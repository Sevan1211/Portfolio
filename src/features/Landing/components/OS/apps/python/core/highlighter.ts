/**
 * Python Syntax Highlighter
 *
 * A lightweight, zero-dependency tokenizer that produces HTML spans
 * with class names for Python syntax coloring. No external library needed.
 */

const KEYWORDS = new Set([
  'False', 'None', 'True', 'and', 'as', 'assert', 'async', 'await',
  'break', 'class', 'continue', 'def', 'del', 'elif', 'else', 'except',
  'finally', 'for', 'from', 'global', 'if', 'import', 'in', 'is',
  'lambda', 'nonlocal', 'not', 'or', 'pass', 'raise', 'return',
  'try', 'while', 'with', 'yield',
]);

const BUILTINS = new Set([
  'print', 'range', 'len', 'int', 'str', 'float', 'list', 'dict',
  'set', 'tuple', 'bool', 'type', 'input', 'open', 'enumerate',
  'zip', 'map', 'filter', 'sorted', 'reversed', 'abs', 'max', 'min',
  'sum', 'any', 'all', 'isinstance', 'issubclass', 'hasattr', 'getattr',
  'setattr', 'delattr', 'super', 'property', 'staticmethod', 'classmethod',
  'ValueError', 'TypeError', 'KeyError', 'IndexError', 'RuntimeError',
  'Exception', 'StopIteration', 'ImportError', 'AttributeError',
  'NameError', 'OSError', 'IOError', 'FileNotFoundError',
]);

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Highlight a line of Python code, returning an HTML string with
 * <span class="py-hl-*"> wrappers.
 */
function highlightLine(line: string): string {
  let result = '';
  let i = 0;

  while (i < line.length) {
    const ch = line[i]!;
    const rest = line.slice(i);

    // ── Comments ──
    if (ch === '#') {
      result += `<span class="py-hl-comment">${escapeHtml(line.slice(i))}</span>`;
      break;
    }

    // ── Triple-quoted strings (only handle opening on the line) ──
    if (rest.startsWith('"""') || rest.startsWith("'''")) {
      const quote = rest.slice(0, 3);
      const endIdx = line.indexOf(quote, i + 3);
      if (endIdx !== -1) {
        const str = line.slice(i, endIdx + 3);
        result += `<span class="py-hl-string">${escapeHtml(str)}</span>`;
        i = endIdx + 3;
      } else {
        // Unclosed on this line
        result += `<span class="py-hl-string">${escapeHtml(line.slice(i))}</span>`;
        break;
      }
      continue;
    }

    // ── Strings (single/double) ──
    if (ch === '"' || ch === "'") {
      let j = i + 1;
      while (j < line.length) {
        if (line[j] === '\\') {
          j += 2; // skip escaped char
          continue;
        }
        if (line[j] === ch) {
          j++;
          break;
        }
        j++;
      }
      result += `<span class="py-hl-string">${escapeHtml(line.slice(i, j))}</span>`;
      i = j;
      continue;
    }

    // ── f-string prefix ──
    if ((ch === 'f' || ch === 'F') && (line[i + 1] === '"' || line[i + 1] === "'")) {
      const q = line[i + 1]!;
      let j = i + 2;
      while (j < line.length) {
        if (line[j] === '\\') { j += 2; continue; }
        if (line[j] === q) { j++; break; }
        j++;
      }
      result += `<span class="py-hl-string">${escapeHtml(line.slice(i, j))}</span>`;
      i = j;
      continue;
    }

    // ── Numbers ──
    if (/[0-9]/.test(ch) || (ch === '.' && i + 1 < line.length && /[0-9]/.test(line[i + 1]!))) {
      let j = i;
      // hex
      if (ch === '0' && (line[j + 1] === 'x' || line[j + 1] === 'X')) {
        j += 2;
        while (j < line.length && /[0-9a-fA-F_]/.test(line[j]!)) j++;
      } else {
        while (j < line.length && /[0-9._eE+\-]/.test(line[j]!)) j++;
      }
      result += `<span class="py-hl-number">${escapeHtml(line.slice(i, j))}</span>`;
      i = j;
      continue;
    }

    // ── Identifiers / keywords ──
    if (/[a-zA-Z_]/.test(ch)) {
      let j = i;
      while (j < line.length && /[a-zA-Z0-9_]/.test(line[j]!)) j++;
      const word = line.slice(i, j);

      if (KEYWORDS.has(word)) {
        result += `<span class="py-hl-keyword">${escapeHtml(word)}</span>`;
      } else if (BUILTINS.has(word)) {
        result += `<span class="py-hl-builtin">${escapeHtml(word)}</span>`;
      } else if (word === 'self') {
        result += `<span class="py-hl-self">${escapeHtml(word)}</span>`;
      } else {
        // Check if followed by '(' → function call
        let k = j;
        while (k < line.length && line[k] === ' ') k++;
        if (line[k] === '(') {
          result += `<span class="py-hl-func">${escapeHtml(word)}</span>`;
        } else {
          result += escapeHtml(word);
        }
      }
      i = j;
      continue;
    }

    // ── Decorators ──
    if (ch === '@') {
      let j = i + 1;
      while (j < line.length && /[a-zA-Z0-9_.]/.test(line[j]!)) j++;
      result += `<span class="py-hl-decorator">${escapeHtml(line.slice(i, j))}</span>`;
      i = j;
      continue;
    }

    // ── Operators ──
    if ('+-*/%=<>!&|^~'.includes(ch)) {
      result += `<span class="py-hl-operator">${escapeHtml(ch)}</span>`;
      i++;
      continue;
    }

    // ── Punctuation / brackets ──
    if ('()[]{}:,.;'.includes(ch)) {
      result += `<span class="py-hl-punct">${escapeHtml(ch)}</span>`;
      i++;
      continue;
    }

    // ── Whitespace & everything else ──
    result += escapeHtml(ch);
    i++;
  }

  return result;
}

/**
 * Highlight a full Python source string.
 * Returns HTML with each line in a div for alignment with the textarea.
 */
export function highlightPython(code: string): string {
  return code
    .split('\n')
    .map((line) => {
      // Preserve empty lines as a single non-breaking space so they still
      // take up a line-height of space.
      if (line.length === 0) return '<div class="py-hl-line">\n</div>';
      return `<div class="py-hl-line">${highlightLine(line)}\n</div>`;
    })
    .join('');
}
