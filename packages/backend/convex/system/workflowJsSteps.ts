"use node"

import { v } from "convex/values"
import {
  newQuickJSWASMModuleFromVariant,
  type QuickJSWASMModule,
} from "quickjs-emscripten-core"
import releaseSyncVariant from "@jitl/quickjs-singlefile-cjs-release-sync"

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
/** A snippet gets a small heap of its own; the module caps it hard. */
const SNIPPET_MEMORY_LIMIT_BYTES = 32 * 1024 * 1024
const SNIPPET_STACK_LIMIT_BYTES = 512 * 1024

/**
 * The QuickJS module is a WebAssembly build with its own heap, loaded once and
 * reused. Loading embeds no file or network access — the variant carries the
 * wasm inline — so this is safe to do lazily inside the action.
 */
let quickJsModulePromise: Promise<QuickJSWASMModule> | null = null

const getQuickJsModule = () => {
  quickJsModulePromise ??= newQuickJSWASMModuleFromVariant(releaseSyncVariant)
  return quickJsModulePromise
}

export type JsStepResult = {
  ok: boolean
  variables: RuntimeVariables
  logs: string[]
  /** Path name the snippet asked for, from `return { next }`. */
  next?: string
  error?: string
}

const stringifyValue = (value: unknown): string => {
  if (value === null || value === undefined) {
    return ""
  }

  if (typeof value === "string") {
    return value.slice(0, MAX_VALUE_CHARS)
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value)
  }

  try {
    return JSON.stringify(value).slice(0, MAX_VALUE_CHARS)
  } catch {
    return String(value).slice(0, MAX_VALUE_CHARS)
  }
}

/** What a finished snippet hands back out of the sandbox, all JSON-safe. */
type SandboxResult = {
  variables: Record<string, unknown>
  result: unknown
  logs: string[]
}

/**
 * The program actually evaluated inside QuickJS.
 *
 * The author's source runs inside two nested functions so a `return` works as
 * it always has, and both the (possibly mutated) `variables` object and the
 * returned value come back as one JSON string. `variables` is injected as a
 * JSON literal rather than a live host object, so the snippet never holds a
 * reference that reaches back into the host. `console` and the input are the
 * only things in scope beyond the standard ECMAScript globals.
 */
const buildProgram = (source: string, inputJson: string) =>
  `"use strict";
(function () {
  var __logs__ = [];
  var console = {
    log: function () {
      if (__logs__.length < ${MAX_LOGS}) {
        var parts = [];
        for (var i = 0; i < arguments.length; i++) {
          var a = arguments[i];
          try {
            parts.push(
              typeof a === "string" ? a : typeof a === "undefined" ? "" : JSON.stringify(a)
            );
          } catch (e) {
            parts.push(String(a));
          }
        }
        __logs__.push(parts.join(" "));
      }
    },
  };
  console.info = console.warn = console.error = console.log;
  var variables = (${inputJson});
  var __result__ = (function () {
${source}
  })();
  return JSON.stringify({
    variables: variables,
    result: typeof __result__ === "undefined" ? null : __result__,
    logs: __logs__,
  });
})()`

/**
 * Runs a workflow author's snippet inside a QuickJS WebAssembly isolate.
 *
 * QuickJS is a separate JavaScript engine compiled to WebAssembly with its own
 * heap: code running inside it has no `globalThis` in common with this process
 * and no way to reach `process`, `require`, the host's prototypes, or anything
 * else outside — which a `node:vm` context, running on the same V8 heap, could
 * not guarantee. The isolate is given only `variables` and `console`, a hard
 * memory ceiling, and a wall-clock deadline enforced by an interrupt handler,
 * then torn down. Input and output cross the boundary as JSON, so no live
 * object reference is ever shared.
 */
export const executeSnippet = async (
  code: string,
  variables: RuntimeVariables
): Promise<JsStepResult> => {
  const source = code.slice(0, MAX_CODE_CHARS).trim()

  if (!source) {
    return { ok: true, variables: {}, logs: [], error: undefined }
  }

  const module = await getQuickJsModule()
  const runtime = module.newRuntime()
  runtime.setMemoryLimit(SNIPPET_MEMORY_LIMIT_BYTES)
  runtime.setMaxStackSize(SNIPPET_STACK_LIMIT_BYTES)

  const deadline = Date.now() + SNIPPET_TIMEOUT_MS
  runtime.setInterruptHandler(() => Date.now() > deadline)

  const context = runtime.newContext()

  try {
    const program = buildProgram(source, JSON.stringify(variables))
    const evaluation = context.evalCode(program)

    if (evaluation.error) {
      const detail = context.dump(evaluation.error)
      evaluation.error.dispose()

      const message =
        isRecord(detail) && typeof detail.message === "string"
          ? detail.message
          : typeof detail === "string"
            ? detail
            : "JavaScript step failed."

      return { ok: false, variables: {}, logs: [], error: message }
    }

    const raw = context.getString(evaluation.value)
    evaluation.value.dispose()

    const parsed = JSON.parse(raw) as SandboxResult
    const finalVariables = isRecord(parsed.variables) ? parsed.variables : {}
    const returned = parsed.result
    const logs = Array.isArray(parsed.logs)
      ? parsed.logs.slice(0, MAX_LOGS).map((line) => String(line))
      : []

    const next: RuntimeVariables = {}

    // Anything the snippet assigned onto `variables`...
    for (const [key, value] of Object.entries(finalVariables)) {
      if (variables[key] !== stringifyValue(value)) {
        next[key] = stringifyValue(value)
      }
    }

    let chosenPath: string | undefined

    // ...plus anything it returned. `{ next, outputs }` picks a Function path;
    // any other object is treated as plain outputs.
    if (isRecord(returned)) {
      const hasPathShape =
        typeof returned.next === "string" || isRecord(returned.outputs)

      if (hasPathShape) {
        chosenPath =
          typeof returned.next === "string" ? returned.next.trim() : undefined

        if (isRecord(returned.outputs)) {
          for (const [key, value] of Object.entries(returned.outputs)) {
            next[key] = stringifyValue(value)
          }
        }
      } else {
        for (const [key, value] of Object.entries(returned)) {
          next[key] = stringifyValue(value)
        }
      }
    }

    return { ok: true, variables: next, logs, next: chosenPath }
  } catch (error) {
    // An interrupt (timeout), a memory-limit abort, or a non-JSON return all
    // land here and are reported as a failed step rather than thrown.
    const message =
      error instanceof Error ? error.message : "JavaScript step failed."

    return { ok: false, variables: {}, logs: [], error: message }
  } finally {
    context.dispose()
    runtime.dispose()
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
    await executeSnippet(
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
