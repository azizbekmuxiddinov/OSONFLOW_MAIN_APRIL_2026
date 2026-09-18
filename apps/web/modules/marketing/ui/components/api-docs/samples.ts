import {
  DEVELOPER_API_EXAMPLE_PATH_PARAMS,
  type DeveloperApiEndpoint,
} from "@workspace/backend/lib/developerApi/catalog"

/**
 * Code samples for the API reference, generated from the same catalog the
 * server routes by, so an example can never drift from the endpoint it shows.
 */

export type SampleLanguage = "curl" | "javascript" | "python"

export const SAMPLE_LANGUAGES: { id: SampleLanguage; label: string }[] = [
  { id: "curl", label: "cURL" },
  { id: "javascript", label: "JavaScript" },
  { id: "python", label: "Python" },
]

const KEY_ENV = "OSONFLOW_API_KEY"

export const examplePath = (endpoint: DeveloperApiEndpoint) => {
  const path = endpoint.path.replace(
    /:([A-Za-z]+)/g,
    (_, name: string) => DEVELOPER_API_EXAMPLE_PATH_PARAMS[name] ?? name
  )
  const takesLimit = endpoint.query?.some((param) => param.name === "limit")

  return endpoint.method === "GET" && takesLimit ? `${path}?limit=20` : path
}

const indent = (text: string, spaces: number) =>
  text
    .split("\n")
    .map((line, index) => (index === 0 ? line : `${" ".repeat(spaces)}${line}`))
    .join("\n")

/** JSON to a Python literal: `true` → `True`, `null` → `None`. */
const toPython = (value: unknown, depth = 0): string => {
  const pad = "    ".repeat(depth + 1)
  const closePad = "    ".repeat(depth)

  if (value === null) return "None"
  if (value === true) return "True"
  if (value === false) return "False"
  if (typeof value === "number") return String(value)
  if (typeof value === "string") return JSON.stringify(value)

  if (Array.isArray(value)) {
    if (value.length === 0) return "[]"
    return `[\n${value.map((item) => `${pad}${toPython(item, depth + 1)}`).join(",\n")},\n${closePad}]`
  }

  const entries = Object.entries(value as Record<string, unknown>)
  if (entries.length === 0) return "{}"

  return `{\n${entries
    .map(
      ([key, item]) =>
        `${pad}${JSON.stringify(key)}: ${toPython(item, depth + 1)}`
    )
    .join(",\n")},\n${closePad}}`
}

const curlSample = (endpoint: DeveloperApiEndpoint, url: string) => {
  const lines = [
    `curl ${endpoint.method === "GET" ? "" : `-X ${endpoint.method} `}"${url}"`,
  ]
  lines.push(`  -H "Authorization: Bearer $${KEY_ENV}"`)

  if (endpoint.bodyEncoding === "multipart") {
    lines.push(`  -F "file=@price-list.pdf"`)
    lines.push(`  -F "category=pricing"`)
  } else if (endpoint.exampleRequest) {
    lines.push(`  -H "Content-Type: application/json"`)
    lines.push(
      `  -d '${JSON.stringify(endpoint.exampleRequest, null, 2).replaceAll("'", "'\\''")}'`
    )
  }

  return lines.join(" \\\n")
}

const javascriptSample = (endpoint: DeveloperApiEndpoint, url: string) => {
  const options: string[] = []

  if (endpoint.method !== "GET") {
    options.push(`method: "${endpoint.method}",`)
  }

  if (endpoint.bodyEncoding === "multipart") {
    return [
      `const form = new FormData()`,
      `form.append("file", fileInput.files[0])`,
      `form.append("category", "pricing")`,
      ``,
      `const response = await fetch("${url}", {`,
      `  method: "POST",`,
      `  headers: { Authorization: \`Bearer \${process.env.${KEY_ENV}}\` },`,
      `  body: form,`,
      `})`,
      `const { data } = await response.json()`,
    ].join("\n")
  }

  const headers = endpoint.exampleRequest
    ? [
        `headers: {`,
        `    Authorization: \`Bearer \${process.env.${KEY_ENV}}\`,`,
        `    "Content-Type": "application/json",`,
        `  },`,
      ].join("\n  ")
    : `headers: { Authorization: \`Bearer \${process.env.${KEY_ENV}}\` },`
  options.push(headers)

  if (endpoint.exampleRequest) {
    options.push(
      `body: JSON.stringify(${indent(JSON.stringify(endpoint.exampleRequest, null, 2), 2)}),`
    )
  }

  return [
    `const response = await fetch("${url}", {`,
    ...options.map((option) => `  ${option}`),
    `})`,
    `const { data } = await response.json()`,
  ].join("\n")
}

const pythonSample = (endpoint: DeveloperApiEndpoint, url: string) => {
  const method = endpoint.method.toLowerCase()
  const args = [
    `"${url}"`,
    `headers={"Authorization": f"Bearer {os.environ['${KEY_ENV}']}"}`,
  ]

  if (endpoint.bodyEncoding === "multipart") {
    args.push(`files={"file": open("price-list.pdf", "rb")}`)
    args.push(`data={"category": "pricing"}`)
  } else if (endpoint.exampleRequest) {
    args.push(`json=${indent(toPython(endpoint.exampleRequest), 4)}`)
  }

  return [
    `import os`,
    `import requests`,
    ``,
    `response = requests.${method}(`,
    ...args.map((arg) => `    ${arg},`),
    `)`,
    `data = response.json()["data"]`,
  ].join("\n")
}

export const buildSample = (
  language: SampleLanguage,
  endpoint: DeveloperApiEndpoint,
  baseUrl: string
) => {
  const url = `${baseUrl.replace(/\/v1\/?$/, "")}${examplePath(endpoint)}`

  switch (language) {
    case "curl":
      return curlSample(endpoint, url)
    case "javascript":
      return javascriptSample(endpoint, url)
    case "python":
      return pythonSample(endpoint, url)
  }
}

/* ── highlighting ────────────────────────────────────────────────────────── */

export type Token = {
  kind: "plain" | "string" | "key" | "number" | "keyword" | "comment" | "flag"
  text: string
}

const KEYWORDS = new Set([
  "const",
  "await",
  "import",
  "from",
  "new",
  "return",
  "true",
  "false",
  "null",
  "True",
  "False",
  "None",
  "curl",
])

const TOKEN_PATTERN =
  /(\/\/[^\n]*|#[^\n]*)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)|(\b-?\d+(?:\.\d+)?\b)|(\s-{1,2}[A-Za-z]+\b)|(\b[A-Za-z_]+\b)/g

/**
 * A deliberately small tokenizer: enough to tell strings, keys, numbers and
 * keywords apart in JSON, shell, JavaScript and Python samples. Output is
 * rendered as text nodes, never as HTML.
 */
export const tokenize = (code: string): Token[] => {
  const tokens: Token[] = []
  let last = 0

  for (const match of code.matchAll(TOKEN_PATTERN)) {
    const index = match.index ?? 0

    if (index > last) {
      tokens.push({ kind: "plain", text: code.slice(last, index) })
    }

    const [text, comment, string, number, flag, word] = match

    if (comment) {
      // `#` inside a URL fragment is not a comment; only treat it as one at
      // the start of a line or after whitespace.
      const before = code[index - 1]
      tokens.push({
        kind: !before || /\s/.test(before) ? "comment" : "plain",
        text,
      })
    } else if (string) {
      const isKey = /^\s*:/.test(code.slice(index + text.length))
      tokens.push({ kind: isKey ? "key" : "string", text })
    } else if (number) {
      tokens.push({ kind: "number", text })
    } else if (flag) {
      tokens.push({ kind: "flag", text })
    } else if (word && KEYWORDS.has(word)) {
      tokens.push({ kind: "keyword", text })
    } else {
      tokens.push({ kind: "plain", text })
    }

    last = index + text.length
  }

  if (last < code.length) {
    tokens.push({ kind: "plain", text: code.slice(last) })
  }

  return tokens
}
