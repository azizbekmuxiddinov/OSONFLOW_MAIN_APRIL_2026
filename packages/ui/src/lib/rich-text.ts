const ALLOWED_TAGS = new Set([
  "a",
  "b",
  "blockquote",
  "br",
  "em",
  "h1",
  "h2",
  "h3",
  "i",
  "li",
  "ol",
  "p",
  "strong",
  "u",
  "ul",
])

const BLOCK_TAGS = new Set(["blockquote", "h1", "h2", "h3", "li", "p"])

const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;")

const escapeAttribute = (value: string) =>
  escapeHtml(value).replaceAll("`", "&#96;")

const isSafeHref = (href: string) => {
  const trimmed = href.trim()
  return (
    trimmed.startsWith("#") ||
    trimmed.startsWith("/") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("http://") ||
    trimmed.startsWith("mailto:") ||
    trimmed.startsWith("tel:")
  )
}

const applyInlineMarkdown = (value: string) => {
  let next = escapeHtml(value)
  next = next.replace(
    /\[([^\]]+)]\(([^)\s]+)\)/g,
    (_match, label: string, href: string) => {
      if (!isSafeHref(href)) return label
      return `<a href="${escapeAttribute(href)}" rel="noreferrer" target="_blank">${label}</a>`
    }
  )
  next = next.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
  next = next.replace(/_([^_\n]+)_/g, "<em>$1</em>")
  return next
}

const plainTextToRichHtml = (value: string) => {
  const blocks = value
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)

  return blocks
    .map((block) => {
      const lines = block.split("\n").map((line) => line.trim())
      const firstLine = lines[0] ?? ""

      if (firstLine.startsWith("### ")) {
        return `<h3>${applyInlineMarkdown(firstLine.slice(4))}</h3>`
      }

      if (firstLine.startsWith("## ")) {
        return `<h2>${applyInlineMarkdown(firstLine.slice(3))}</h2>`
      }

      if (firstLine.startsWith("# ")) {
        return `<h1>${applyInlineMarkdown(firstLine.slice(2))}</h1>`
      }

      if (lines.every((line) => /^[-*]\s+/.test(line))) {
        return `<ul>${lines
          .map(
            (line) =>
              `<li>${applyInlineMarkdown(line.replace(/^[-*]\s+/, ""))}</li>`
          )
          .join("")}</ul>`
      }

      if (lines.every((line) => /^\d+\.\s+/.test(line))) {
        return `<ol>${lines
          .map(
            (line) =>
              `<li>${applyInlineMarkdown(line.replace(/^\d+\.\s+/, ""))}</li>`
          )
          .join("")}</ol>`
      }

      if (lines.every((line) => /^>\s?/.test(line))) {
        return `<blockquote>${lines
          .map((line) => applyInlineMarkdown(line.replace(/^>\s?/, "")))
          .join("<br>")}</blockquote>`
      }

      return `<p>${lines.map(applyInlineMarkdown).join("<br>")}</p>`
    })
    .join("")
}

export const isRichTextHtml = (value: string) =>
  /<\/?[a-z][\s\S]*>/i.test(value)

export const sanitizeRichTextHtml = (value: string) => {
  if (typeof document === "undefined") {
    return escapeHtml(value)
  }

  const template = document.createElement("template")
  template.innerHTML = value

  const sanitizeNode = (node: Node): Node | null => {
    if (node.nodeType === Node.TEXT_NODE) {
      return document.createTextNode(node.textContent ?? "")
    }

    if (node.nodeType !== Node.ELEMENT_NODE) {
      return null
    }

    const element = node as HTMLElement
    const tagName = element.tagName.toLowerCase()
    const normalizedTag =
      tagName === "div" ? "p" : tagName === "span" ? "" : tagName

    const sanitizedChildren = Array.from(element.childNodes)
      .map(sanitizeNode)
      .filter((child): child is Node => child !== null)

    if (!normalizedTag || !ALLOWED_TAGS.has(normalizedTag)) {
      const fragment = document.createDocumentFragment()
      sanitizedChildren.forEach((child) => fragment.appendChild(child))
      return fragment
    }

    const cleanElement = document.createElement(normalizedTag)
    if (normalizedTag === "a") {
      const href = element.getAttribute("href") ?? ""
      if (isSafeHref(href)) {
        cleanElement.setAttribute("href", href.trim())
        cleanElement.setAttribute("rel", "noreferrer")
        cleanElement.setAttribute("target", "_blank")
      }
    }

    sanitizedChildren.forEach((child) => cleanElement.appendChild(child))

    if (
      BLOCK_TAGS.has(normalizedTag) &&
      cleanElement.textContent?.trim() === "" &&
      cleanElement.querySelector("br") === null
    ) {
      return null
    }

    return cleanElement
  }

  const wrapper = document.createElement("div")
  Array.from(template.content.childNodes)
    .map(sanitizeNode)
    .filter((child): child is Node => child !== null)
    .forEach((child) => wrapper.appendChild(child))

  return wrapper.innerHTML.trim()
}

export const richTextStorageToHtml = (value: string) => {
  const trimmed = value.trim()
  if (!trimmed) return ""

  if (isRichTextHtml(trimmed)) {
    return sanitizeRichTextHtml(trimmed)
  }

  return sanitizeRichTextHtml(plainTextToRichHtml(trimmed))
}

// The workflow message editor is a contenteditable that stores its own
// innerHTML, so a pasted `<img onerror>` or `<script>` would otherwise be
// stored verbatim and run in the next person who opens that workflow. These
// are the tags that editor legitimately produces; `span` is kept only for the
// {{variable}} pills, and only with the attributes those pills carry.
const WORKFLOW_ALLOWED_TAGS = new Set([
  ...ALLOWED_TAGS,
  "span",
  "code",
])

const VARIABLE_TOKEN_CLASSES = new Set(["variable-token", "unknown"])

// Elements whose text content is code or markup, not prose: they are dropped
// whole rather than unwrapped, so a <script>'s body is not surfaced as text.
const WORKFLOW_DROP_WITH_CONTENT = new Set([
  "script",
  "style",
  "noscript",
  "template",
  "iframe",
  "object",
  "embed",
  "svg",
  "math",
])

/**
 * Sanitizes the HTML a workflow message/card holds before it is rendered with
 * dangerouslySetInnerHTML in the builder. It keeps the rich-text formatting and
 * the variable pills (`<span class="variable-token" data-variable=…>`) but
 * drops every scriptable tag, attribute and URL. Runs against the DOM, so it is
 * client-only; on the server it falls back to escaping, which the builder never
 * hits.
 */
export const sanitizeWorkflowMessageHtml = (value: string): string => {
  const trimmed = value.trim()

  if (!trimmed) {
    return ""
  }

  if (typeof document === "undefined") {
    return escapeHtml(value)
  }

  const template = document.createElement("template")
  template.innerHTML = trimmed

  const sanitizeNode = (node: Node): Node | null => {
    if (node.nodeType === Node.TEXT_NODE) {
      return document.createTextNode(node.textContent ?? "")
    }

    if (node.nodeType !== Node.ELEMENT_NODE) {
      return null
    }

    const element = node as HTMLElement
    const tagName = element.tagName.toLowerCase()

    // A scriptable element is removed outright — its contents are code, not
    // text to surface — so this returns before its children are walked.
    if (WORKFLOW_DROP_WITH_CONTENT.has(tagName)) {
      return null
    }

    const normalizedTag = tagName === "div" ? "p" : tagName

    const sanitizedChildren = Array.from(element.childNodes)
      .map(sanitizeNode)
      .filter((child): child is Node => child !== null)

    // A span is kept only when it is a variable pill; any other span (and any
    // tag not on the allowlist) is unwrapped so its text survives but its
    // markup does not.
    const isTokenSpan =
      normalizedTag === "span" &&
      (element.getAttribute("class") ?? "")
        .split(/\s+/)
        .some((cls) => cls === "variable-token")

    if (
      !WORKFLOW_ALLOWED_TAGS.has(normalizedTag) ||
      (normalizedTag === "span" && !isTokenSpan)
    ) {
      const fragment = document.createDocumentFragment()
      sanitizedChildren.forEach((child) => fragment.appendChild(child))
      return fragment
    }

    const cleanElement = document.createElement(normalizedTag)

    if (normalizedTag === "a") {
      const href = element.getAttribute("href") ?? ""
      if (isSafeHref(href)) {
        cleanElement.setAttribute("href", href.trim())
        cleanElement.setAttribute("rel", "noreferrer")
        cleanElement.setAttribute("target", "_blank")
      }
    }

    if (isTokenSpan) {
      const safeClasses = (element.getAttribute("class") ?? "")
        .split(/\s+/)
        .filter((cls) => VARIABLE_TOKEN_CLASSES.has(cls))
      cleanElement.setAttribute("class", safeClasses.join(" "))
      cleanElement.setAttribute("contenteditable", "false")

      const variable = element.getAttribute("data-variable")
      if (variable) {
        cleanElement.setAttribute("data-variable", variable)
      }

      const title = element.getAttribute("title")
      if (title) {
        cleanElement.setAttribute("title", title)
      }
    }

    sanitizedChildren.forEach((child) => cleanElement.appendChild(child))

    return cleanElement
  }

  const wrapper = document.createElement("div")
  Array.from(template.content.childNodes)
    .map(sanitizeNode)
    .filter((child): child is Node => child !== null)
    .forEach((child) => wrapper.appendChild(child))

  return wrapper.innerHTML.trim()
}
