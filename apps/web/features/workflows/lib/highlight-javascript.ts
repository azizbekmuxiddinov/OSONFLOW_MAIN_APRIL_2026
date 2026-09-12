/**
 * A small JavaScript tokenizer for the code editor's highlight layer.
 *
 * Deliberately hand-rolled rather than pulled from Shiki or Prism: the only
 * language this app ever shows is the JavaScript in a Code or Function step,
 * and a highlighter shipped to every dashboard visitor to colour one textarea
 * is a poor trade. It is display-only — the textarea above it still holds the
 * real value — so a token this misreads costs a colour, never content.
 *
 * No lookbehind anywhere: Safari only gained it in 16.4, and an unsupported
 * group throws when the pattern is constructed, which would take down the
 * whole module rather than degrade.
 */

const KEYWORDS = [
  "async", "await", "break", "case", "catch", "class", "const", "continue",
  "debugger", "default", "delete", "do", "else", "export", "extends",
  "false", "finally", "for", "function", "if", "import", "in", "instanceof",
  "let", "new", "null", "of", "return", "static", "super", "switch", "this",
  "throw", "true", "try", "typeof", "undefined", "var", "void", "while",
  "yield",
]

const TOKENS = new RegExp(
  [
    // Comments first: everything inside one is a comment, whatever it looks like.
    String.raw`(?<comment>\/\/[^\n]*|\/\*[\s\S]*?\*\/)`,
    // Strings, each allowing escapes. Quoted forms stop at a newline so one
    // unclosed quote tints a single line rather than the rest of the file.
    String.raw`(?<string>\`(?:\\.|[^\`\\])*\`|"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*')`,
    String.raw`(?<number>\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b)`,
    String.raw`(?<keyword>\b(?:${KEYWORDS.join("|")})\b)`,
    // The dot is captured with the name so the property can be found without
    // a lookbehind; it is re-emitted unstyled below.
    String.raw`(?<prop>\.[A-Za-z_$][\w$]*)`,
    String.raw`(?<fn>\b[A-Za-z_$][\w$]*(?=\s*\())`,
  ].join("|"),
  "g",
)

const escapeHtml = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")

/** Returns HTML for `code`, with every token wrapped in a `tok-*` span. */
export const highlightJavascript = (code: string) => {
  let out = ""
  let lastIndex = 0
  let match: RegExpExecArray | null

  TOKENS.lastIndex = 0

  while ((match = TOKENS.exec(code)) !== null) {
    out += escapeHtml(code.slice(lastIndex, match.index))

    const groups = match.groups ?? {}
    const kind = Object.keys(groups).find((key) => groups[key] !== undefined)
    const text = match[0]

    if (kind === "prop") {
      out += `.<span class="tok-prop">${escapeHtml(text.slice(1))}</span>`
    } else if (kind) {
      out += `<span class="tok-${kind}">${escapeHtml(text)}</span>`
    } else {
      out += escapeHtml(text)
    }

    lastIndex = match.index + text.length
  }

  out += escapeHtml(code.slice(lastIndex))

  // A textarea renders a final newline as an extra empty line but a <pre> does
  // not, so without this the overlay comes up one line short and every line
  // below the viewport's fold drifts against the caret.
  return out.endsWith("\n") ? `${out} ` : out
}
