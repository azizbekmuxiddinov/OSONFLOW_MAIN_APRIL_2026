"use node"

import variant from "@jitl/quickjs-singlefile-mjs-release-sync"
import { v } from "convex/values"
import {
  newQuickJSWASMModuleFromVariant,
  shouldInterruptAfterDeadline,
} from "quickjs-emscripten-core"

import { internal } from "../_generated/api"
import { internalAction } from "../_generated/server"
import {
  asString,
  isRecord,
  type RuntimeVariables,
} from "../lib/workflowEngine"

const SNIPPET_TIMEOUT_MS = 2_000
const MAX_CODE_CHARS = 20_000
const MAX_LOGS = 25
const MAX_VALUE_CHARS = 10_000
const SNIPPET_MEMORY_LIMIT_BYTES = 32 * 1024 * 1024
const SNIPPET_STACK_LIMIT_BYTES = 512 * 1024

export type JsStepResult = {
  ok: boolean
  variables: RuntimeVariables
  logs: string[]
  /** Path name the snippet asked for, from `return { next }`. */
  next?: string
  error?: string
}

/**
 * Turns the snippet's values into the strings workflow variables hold. It runs
 * inside the interpreter, so the host never handles an object the snippet made
 * and never runs one of its getters or `toJSON`s.
 */
const STRINGIFY_SOURCE = `(value) => {
  if (value === null || value === undefined) return ""
  if (typeof value === "string") return value.slice(0, ${MAX_VALUE_CHARS})
  if (typeof value === "number" || typeof value === "boolean") return String(value)
  try {
    return JSON.stringify(value).slice(0, ${MAX_VALUE_CHARS})
  } catch {
    return String(value).slice(0, ${MAX_VALUE_CHARS})
  }
}`

/**
 * Wraps the snippet so the only thing that leaves the interpreter is one JSON
 * string. Assigning to `variables` itself has no effect, as before: what is
 * read back is the object the snippet was handed.
 */
const buildProgram = (source: string, variables: RuntimeVariables) => `"use strict";
const __scoped = JSON.parse(${JSON.stringify(JSON.stringify(variables))});
var variables = __scoped;
const __logs = [];
const __str = ${STRINGIFY_SOURCE};
const __isRecord = (value) => Boolean(value) && typeof value === "object" && !Array.isArray(value);
const __entries = (record) => Object.entries(record).map(([key, value]) => [key, __str(value)]);
var console = {
  log: (...args) => {
    if (__logs.length < ${MAX_LOGS}) __logs.push(args.map(__str).join(" "));
  },
};
let __result;
try {
  const returned = (function(){${source}
})();
  __result = { ok: true, variables: __entries(__scoped), outputs: [] };
  if (__isRecord(returned)) {
    const hasPathShape = typeof returned.next === "string" || __isRecord(returned.outputs);
    if (hasPathShape) {
      if (typeof returned.next === "string") __result.next = returned.next.trim();
      if (__isRecord(returned.outputs)) __result.outputs = __entries(returned.outputs);
    } else {
      __result.outputs = __entries(returned);
    }
  }
} catch (error) {
  __result = {
    ok: false,
    error: error instanceof Error ? String(error.message) : __str(error) || "JavaScript step failed.",
  };
}
__result.logs = __logs;
JSON.stringify(__result);`

const readStringPairs = (value: unknown): Array<[string, string]> =>
  Array.isArray(value)
    ? value.flatMap((pair): Array<[string, string]> =>
        Array.isArray(pair) &&
        typeof pair[0] === "string" &&
        typeof pair[1] === "string"
          ? [[pair[0], pair[1].slice(0, MAX_VALUE_CHARS)]]
          : []
      )
    : []

const describeThrown = (thrown: unknown) => {
  // Only the first line: anything after it is the interpreter reporting on its
  // own cleanup, which means nothing to a workflow author.
  const message = (isRecord(thrown) ? asString(thrown.message) : "").split(
    "\n"
  )[0]

  if (message === "interrupted") {
    return `Script execution timed out after ${SNIPPET_TIMEOUT_MS}ms.`
  }

  return message || "JavaScript step failed."
}

/**
 * Runs a workflow author's snippet in QuickJS, a separate JavaScript engine
 * compiled to WebAssembly, with its own heap and a deadline and memory cap.
 *
 * Workflow authors are tenants, so their code is untrusted: it must not reach
 * the backend's environment, which holds every organization's secrets.
 * `node:vm` cannot guarantee that — any host object handed into the context
 * leads back to the host's `Function` and `process` — so nothing from this
 * process is ever placed inside the interpreter. Variables go in as JSON and the
 * result comes back as a single JSON string.
 *
 * Every run gets a WebAssembly module of its own (a few milliseconds to
 * create). A snippet that leaves the interpreter unable to clean up after
 * itself then takes only its own module down, which is garbage collected,
 * instead of leaking memory that the next organization's snippet would share.
 */
export const executeSnippet = async (
  code: string,
  variables: RuntimeVariables
): Promise<JsStepResult> => {
  const source = code.slice(0, MAX_CODE_CHARS).trim()

  if (!source) {
    return { ok: true, variables: {}, logs: [], error: undefined }
  }

  let raw: unknown

  try {
    const QuickJS = await newQuickJSWASMModuleFromVariant(variant)
    raw = QuickJS.evalCode(buildProgram(source, variables), {
      shouldInterrupt: shouldInterruptAfterDeadline(
        Date.now() + SNIPPET_TIMEOUT_MS
      ),
      memoryLimitBytes: SNIPPET_MEMORY_LIMIT_BYTES,
      maxStackSizeBytes: SNIPPET_STACK_LIMIT_BYTES,
    })
  } catch (thrown) {
    return { ok: false, variables: {}, logs: [], error: describeThrown(thrown) }
  }

  // The snippet shares the interpreter with the wrapper and could have
  // tampered with it, so the result is treated as untrusted input.
  let parsed: unknown

  try {
    parsed = typeof raw === "string" ? JSON.parse(raw) : null
  } catch {
    parsed = null
  }

  if (!isRecord(parsed)) {
    return {
      ok: false,
      variables: {},
      logs: [],
      error: "JavaScript step returned an unreadable result.",
    }
  }

  const logs = (Array.isArray(parsed.logs) ? parsed.logs : [])
    .filter((line): line is string => typeof line === "string")
    .slice(0, MAX_LOGS)

  if (parsed.ok !== true) {
    return {
      ok: false,
      variables: {},
      logs,
      error: asString(parsed.error) || "JavaScript step failed.",
    }
  }

  const next: RuntimeVariables = {}

  // Anything the snippet assigned onto `variables`...
  for (const [key, value] of readStringPairs(parsed.variables)) {
    if (variables[key] !== value) {
      next[key] = value
    }
  }

  // ...plus anything it returned. `{ next, outputs }` picks a Function path;
  // any other object is treated as plain outputs.
  for (const [key, value] of readStringPairs(parsed.outputs)) {
    next[key] = value
  }

  return {
    ok: true,
    variables: next,
    logs,
    next: typeof parsed.next === "string" ? parsed.next : undefined,
  }
}

/** Standalone execution used by the builder's Run panel preview. */
export const runSnippet = internalAction({
  args: {
    code: v.string(),
    variables: v.any(),
  },
  returns: v.object({
    ok: v.boolean(),
    variables: v.any(),
    logs: v.array(v.string()),
    next: v.optional(v.string()),
    error: v.optional(v.string()),
  }),
  handler: async (_ctx, args) =>
    executeSnippet(
      args.code,
      (isRecord(args.variables) ? args.variables : {}) as RuntimeVariables
    ),
})

export const runNode = internalAction({
  args: {
    sessionId: v.id("workflowSessions"),
    conversationId: v.id("conversations"),
    nodeId: v.string(),
  },
  returns: v.object({ ok: v.boolean(), error: v.optional(v.string()) }),
  handler: async (ctx, args) => {
    const context = await ctx.runQuery(
      internal.system.workflowApiSteps.getStepContext,
      {
        sessionId: args.sessionId,
        conversationId: args.conversationId,
        nodeId: args.nodeId,
      }
    )

    if (!context) {
      return { ok: false, error: "Session not ready for JavaScript step" }
    }

    const data = isRecord(context.nodeData) ? context.nodeData : {}
    const isFunction = context.nodeType === "function"
    const result = await executeSnippet(
      asString(data.code),
      context.variables as RuntimeVariables
    )

    let handle: string | undefined
    let handleLabel: string | undefined
    let error = result.error

    if (isFunction) {
      const paths = (Array.isArray(data.paths) ? data.paths : [])
        .filter(isRecord)
        .map((path) => ({
          id: asString(path.id),
          name: asString(path.name).trim(),
        }))
        .filter((path) => path.id !== "")

      if (result.ok) {
        const chosen = result.next
          ? paths.find((path) => path.name === result.next)
          : undefined

        if (result.next && !chosen) {
          error = `No path named "${result.next}"; took the first one instead.`
        }

        const taken = chosen ?? paths[0]
        handle = taken?.id
        handleLabel = taken?.name
      } else {
        // A thrown snippet takes an "error" path when the author declared one.
        const errorPath = paths.find((path) => path.name === "error")
        handle = errorPath?.id
        handleLabel = errorPath?.name ?? "error (no path declared)"
      }
    }

    await ctx.runMutation(internal.system.workflowRuntime.continueAfterAction, {
      sessionId: args.sessionId,
      conversationId: args.conversationId,
      nodeId: args.nodeId,
      kind: isFunction ? "function" : "javascript",
      ok: result.ok,
      status: result.ok ? 200 : 0,
      resultVariables: result.variables,
      handle,
      handleLabel,
      error,
    })

    return { ok: result.ok, error }
  },
})
