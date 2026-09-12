"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useQuery } from "convex/react"
import { api } from "@workspace/backend/_generated/api"
import type { Id } from "@workspace/backend/_generated/dataModel"
import type { Node } from "reactflow"
import type { NodeData } from "../lib/types"

/**
 * Replay plays back a conversation that already happened against the canvas it
 * ran on. It deliberately mirrors the test-run surface — the conversation list
 * docked right, the step log across the bottom — so the two read as one tool
 * rather than as two different inspectors.
 */

type RunOutcome = "completed" | "abandoned" | "live"

type TraceEvent = {
  at: number
  level: string
  nodeId?: string
  nodeType?: string
  title: string
  detail?: string
}

type ReplayPanelProps = {
  workflowId: Id<"workflows">
  nodes: Node<NodeData>[]
  onClose?: () => void
  onActiveNodeChange?: (state: {
    activeNodeId: string | null
    waitingNodeId: string | null
  }) => void
}

const DOCK_MIN_H = 150
const DOCK_MAX_H = 560
const DOCK_DEFAULT_H = 264

/** Milliseconds each step holds the canvas while the replay is playing. */
const PLAY_INTERVAL_MS = 900

const OUTCOME_LABEL: Record<RunOutcome, string> = {
  completed: "Finished",
  abandoned: "Dropped off",
  live: "In progress",
}

const FILTERS: Array<{ id: RunOutcome | "all"; label: string }> = [
  { id: "all", label: "All" },
  { id: "completed", label: "Finished" },
  { id: "abandoned", label: "Dropped off" },
  { id: "live", label: "In progress" },
]

const formatClock = (ts: number) => {
  const date = new Date(ts)
  const pad = (value: number) => String(value).padStart(2, "0")
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

const formatAgo = (ts: number) => {
  const seconds = Math.max(0, Math.round((Date.now() - ts) / 1000))

  if (seconds < 60) {
    return "just now"
  }

  const minutes = Math.round(seconds / 60)

  if (minutes < 60) {
    return `${minutes} min ago`
  }

  const hours = Math.round(minutes / 60)

  if (hours < 24) {
    return `${hours} hr ago`
  }

  const days = Math.round(hours / 24)
  return days === 1 ? "yesterday" : `${days} days ago`
}

const formatDuration = (ms: number) => {
  if (ms < 1000) {
    return "under a second"
  }

  const seconds = Math.round(ms / 1000)

  if (seconds < 60) {
    return `${seconds}s`
  }

  const minutes = Math.floor(seconds / 60)
  return `${minutes}m ${seconds % 60}s`
}

type ReplayIconName = "play" | "pause" | "prev" | "next" | "close" | "back"

const ReplayIcon = ({ name }: { name: ReplayIconName }) => {
  const common = {
    width: 16,
    height: 16,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  }

  switch (name) {
    case "play":
      return (
        <svg {...common}>
          <path d="M7 4.5 19 12 7 19.5Z" fill="currentColor" stroke="none" />
        </svg>
      )
    case "pause":
      return (
        <svg {...common}>
          <rect x="7" y="5" width="3.4" height="14" rx="1" fill="currentColor" stroke="none" />
          <rect x="13.6" y="5" width="3.4" height="14" rx="1" fill="currentColor" stroke="none" />
        </svg>
      )
    case "prev":
      return (
        <svg {...common}>
          <path d="M18 6v12M8 12l8-6v12Z" />
        </svg>
      )
    case "next":
      return (
        <svg {...common}>
          <path d="M6 6v12M16 12 8 6v12Z" />
        </svg>
      )
    case "back":
      return (
        <svg {...common}>
          <path d="M15 18 9 12l6-6" />
        </svg>
      )
    default:
      return (
        <svg {...common}>
          <path d="M6 6l12 12M18 6 6 18" />
        </svg>
      )
  }
}

const ReplayPanel = ({
  workflowId,
  nodes,
  onClose,
  onActiveNodeChange,
}: ReplayPanelProps) => {
  const [filter, setFilter] = useState<RunOutcome | "all">("all")
  const [selectedId, setSelectedId] = useState<Id<"workflowSessions"> | null>(
    null
  )
  const [stepIndex, setStepIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [dockHeight, setDockHeight] = useState(DOCK_DEFAULT_H)
  const dockResizeRef = useRef<{ startY: number; startHeight: number } | null>(
    null
  )
  const logRef = useRef<HTMLDivElement | null>(null)
  const dockRef = useRef<HTMLElement | null>(null)

  const sessionList = useQuery(api.private.workflowAnalytics.listSessions, {
    workflowId,
    ...(filter === "all" ? {} : { outcome: filter }),
  })

  const run = useQuery(
    api.private.workflowAnalytics.getSession,
    selectedId ? { sessionId: selectedId } : "skip"
  )

  const nodeNameById = useMemo(() => {
    const names = new Map<string, string>()

    for (const node of nodes) {
      const data = node.data as { customName?: string; label?: string }
      names.set(node.id, data?.customName?.trim() || data?.label || node.type || "Step")
    }

    return names
  }, [nodes])

  const trace = useMemo(() => (run?.trace ?? []) as TraceEvent[], [run])
  const lastIndex = Math.max(0, trace.length - 1)

  /**
   * The canvas follows the most recent event that names a node: plenty of
   * events (a branch result, a generation finishing) belong to the step that
   * is already lit, and re-deriving it keeps the highlight from flickering off
   * between them.
   */
  const { activeNodeId, waitingNodeId } = useMemo(() => {
    if (trace.length === 0) {
      return { activeNodeId: null, waitingNodeId: null }
    }

    for (let index = Math.min(stepIndex, lastIndex); index >= 0; index -= 1) {
      const event = trace[index]

      if (event?.nodeId) {
        return event.level === "wait"
          ? { activeNodeId: null, waitingNodeId: event.nodeId }
          : { activeNodeId: event.nodeId, waitingNodeId: null }
      }
    }

    return { activeNodeId: null, waitingNodeId: null }
  }, [lastIndex, stepIndex, trace])

  /**
   * The builder passes this as an inline arrow, so depending on it directly
   * would re-fire on every parent render — and the unmount cleanup below would
   * clear the highlight a beat after each one.
   */
  const reportActiveNode = useRef(onActiveNodeChange)

  useEffect(() => {
    reportActiveNode.current = onActiveNodeChange
  }, [onActiveNodeChange])

  useEffect(() => {
    reportActiveNode.current?.({ activeNodeId, waitingNodeId })
  }, [activeNodeId, waitingNodeId])

  // Clear the canvas highlight when the panel goes away, so a closed replay
  // never leaves a step lit as though a run were still sitting on it.
  useEffect(
    () => () =>
      reportActiveNode.current?.({ activeNodeId: null, waitingNodeId: null }),
    []
  )

  const selectRun = useCallback((id: Id<"workflowSessions"> | null) => {
    setSelectedId(id)
    setStepIndex(0)
    setPlaying(false)
  }, [])

  useEffect(() => {
    if (!playing || stepIndex >= lastIndex) {
      return
    }

    const timer = window.setTimeout(() => {
      const next = Math.min(stepIndex + 1, lastIndex)
      setStepIndex(next)

      if (next >= lastIndex) {
        setPlaying(false)
      }
    }, PLAY_INTERVAL_MS)

    return () => window.clearTimeout(timer)
  }, [lastIndex, playing, stepIndex])

  // Keep the step under the playhead in view as the replay advances.
  useEffect(() => {
    const row = logRef.current?.querySelector<HTMLElement>(".replay-step.current")
    row?.scrollIntoView({ block: "nearest" })
  }, [stepIndex])

  const startDockResize = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      event.preventDefault()
      dockResizeRef.current = { startY: event.clientY, startHeight: dockHeight }
      document.body.classList.add("dock-resizing")

      const onMove = (moveEvent: PointerEvent) => {
        const state = dockResizeRef.current

        if (!state) {
          return
        }

        const next = state.startHeight + (state.startY - moveEvent.clientY)
        setDockHeight(Math.min(DOCK_MAX_H, Math.max(DOCK_MIN_H, next)))
      }

      const onUp = () => {
        dockResizeRef.current = null
        document.body.classList.remove("dock-resizing")
        window.removeEventListener("pointermove", onMove)
        window.removeEventListener("pointerup", onUp)
      }

      window.addEventListener("pointermove", onMove)
      window.addEventListener("pointerup", onUp)
    },
    [dockHeight]
  )

  // The chat panel and the canvas tools sit above the dock, so publish its
  // live height on the shell the same way the test-run dock does.
  useEffect(() => {
    const shell = dockRef.current?.closest(".builder-shell")

    if (!(shell instanceof HTMLElement)) {
      return
    }

    shell.style.setProperty("--dock-h", `${dockHeight}px`)

    return () => {
      shell.style.removeProperty("--dock-h")
    }
  }, [dockHeight])

  const runs = sessionList?.runs ?? []
  const variableEntries = useMemo(
    () =>
      Object.entries(run?.variables ?? {}).filter(
        ([, value]) => value !== undefined && value !== null && value !== ""
      ),
    [run]
  )

  const renderRunList = () => {
    if (sessionList === undefined) {
      return <div className="replay-empty">Loading conversations…</div>
    }

    if (runs.length === 0) {
      return (
        <div className="replay-empty">
          <strong>No conversations yet</strong>
          <p>
            Once people talk to your published flow, every conversation shows up
            here and you can watch it step by step.
          </p>
        </div>
      )
    }

    return (
      <div className="replay-run-list">
        {runs.map((entry) => (
          <button
            key={entry.id}
            type="button"
            className="replay-run"
            onClick={() => selectRun(entry.id)}
          >
            <span className="replay-run-top">
              <span className="replay-run-name">{entry.contactName}</span>
              <span className={`replay-pill outcome-${entry.outcome}`}>
                {OUTCOME_LABEL[entry.outcome as RunOutcome]}
              </span>
            </span>
            <span className="replay-run-meta">
              <span>{formatAgo(entry.startedAt)}</span>
              <span aria-hidden>·</span>
              <span>
                {entry.stepCount} {entry.stepCount === 1 ? "step" : "steps"}
              </span>
              <span aria-hidden>·</span>
              <span>{formatDuration(entry.durationMs)}</span>
              {entry.errorCount > 0 && (
                <span className="replay-run-errors">
                  {entry.errorCount} {entry.errorCount === 1 ? "error" : "errors"}
                </span>
              )}
            </span>
            {entry.lastNodeId && entry.outcome === "abandoned" && (
              <span className="replay-run-stopped">
                Stopped at {nodeNameById.get(entry.lastNodeId) ?? "a removed step"}
              </span>
            )}
          </button>
        ))}
      </div>
    )
  }

  const renderRunDetail = () => {
    if (run === undefined) {
      return <div className="replay-empty">Loading conversation…</div>
    }

    return (
      <div className="replay-detail">
        <dl className="replay-facts">
          <div>
            <dt>Outcome</dt>
            <dd>
              <span className={`replay-pill outcome-${run.outcome}`}>
                {OUTCOME_LABEL[run.outcome as RunOutcome]}
              </span>
            </dd>
          </div>
          <div>
            <dt>Started</dt>
            <dd>{formatAgo(run.startedAt)}</dd>
          </div>
          <div>
            <dt>Steps taken</dt>
            <dd>{run.stepCount}</dd>
          </div>
          <div>
            <dt>Stopped at</dt>
            <dd>
              {run.lastNodeId
                ? (nodeNameById.get(run.lastNodeId) ?? "A step that no longer exists")
                : "—"}
            </dd>
          </div>
        </dl>

        <a
          className="replay-open-conversation"
          href={`/conversations/${run.conversationId}`}
          target="_blank"
          rel="noreferrer"
        >
          Read the full conversation
        </a>

        <h3 className="replay-subhead">What the flow collected</h3>
        {variableEntries.length === 0 ? (
          <p className="replay-note">Nothing was saved during this conversation.</p>
        ) : (
          <div className="replay-vars">
            {variableEntries.map(([key, value]) => (
              <div key={key} className="replay-var">
                <span className="replay-var-key">{key}</span>
                <span className="replay-var-value">{String(value)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      <aside className="side-drawer chat-inspector-sheet">
        <section className="chat-runner">
          <div className="chat-runner-header">
            <div className="chat-runner-heading">
              {selectedId && (
                <button
                  type="button"
                  className="replay-back"
                  onClick={() => selectRun(null)}
                  title="Back to all conversations"
                  aria-label="Back to all conversations"
                >
                  <ReplayIcon name="back" />
                </button>
              )}
              <h2>{selectedId ? (run?.contactName ?? "Conversation") : "Real conversations"}</h2>
            </div>
            {onClose && (
              <div className="chat-runner-actions">
                <button
                  type="button"
                  onClick={onClose}
                  title="Close"
                  aria-label="Close replay"
                >
                  <ReplayIcon name="close" />
                </button>
              </div>
            )}
          </div>

          {!selectedId && (
            <>
              <p className="replay-lede">
                Watch how real people moved through this flow, step by step.
              </p>
              <div className="replay-filters" role="tablist" aria-label="Filter conversations">
                {FILTERS.map((entry) => (
                  <button
                    key={entry.id}
                    type="button"
                    role="tab"
                    aria-selected={filter === entry.id}
                    className={filter === entry.id ? "active" : ""}
                    onClick={() => setFilter(entry.id)}
                  >
                    {entry.label}
                  </button>
                ))}
              </div>
            </>
          )}

          <div className="replay-body">
            {selectedId ? renderRunDetail() : renderRunList()}
          </div>

          {!selectedId && sessionList?.truncated && (
            <p className="replay-note replay-foot">
              Showing the most recent conversations only.
            </p>
          )}
        </section>
      </aside>

      <section className="run-dock" ref={dockRef} aria-label="Replay timeline">
        <div
          className="run-dock-resize"
          role="separator"
          aria-orientation="horizontal"
          title="Drag to resize"
          onPointerDown={startDockResize}
        />
        <div className="run-dock-bar">
          <div className="replay-transport">
            <button
              type="button"
              disabled={!selectedId || trace.length === 0}
              onClick={() => setStepIndex((current) => Math.max(0, current - 1))}
              title="Previous step"
              aria-label="Previous step"
            >
              <ReplayIcon name="prev" />
            </button>
            <button
              type="button"
              className="replay-play"
              disabled={!selectedId || trace.length === 0}
              onClick={() => {
                if (stepIndex >= lastIndex) {
                  setStepIndex(0)
                }
                setPlaying((current) => !current)
              }}
              title={playing ? "Pause" : "Play"}
              aria-label={playing ? "Pause replay" : "Play replay"}
            >
              <ReplayIcon name={playing ? "pause" : "play"} />
            </button>
            <button
              type="button"
              disabled={!selectedId || trace.length === 0}
              onClick={() =>
                setStepIndex((current) => Math.min(lastIndex, current + 1))
              }
              title="Next step"
              aria-label="Next step"
            >
              <ReplayIcon name="next" />
            </button>
          </div>

          <input
            className="replay-scrub"
            type="range"
            min={0}
            max={lastIndex}
            value={Math.min(stepIndex, lastIndex)}
            disabled={!selectedId || trace.length === 0}
            aria-label="Replay position"
            onChange={(event) => {
              setPlaying(false)
              setStepIndex(Number(event.target.value))
            }}
          />

          <span className="run-dock-metric">
            {trace.length === 0
              ? "No steps"
              : `Step ${Math.min(stepIndex, lastIndex) + 1} of ${trace.length}`}
          </span>
        </div>

        <div className="run-dock-body" ref={logRef}>
          {!selectedId ? (
            <div className="run-dock-empty">
              <strong>Pick a conversation</strong>
              <p>Choose one on the right to replay it on the canvas.</p>
            </div>
          ) : trace.length === 0 ? (
            <div className="run-dock-empty">
              <strong>Nothing recorded</strong>
              <p>This conversation ended before any step ran.</p>
            </div>
          ) : (
            <div className="replay-steps" role="log">
              {run && run.droppedSteps > 0 && (
                <p className="replay-note replay-dropped">
                  The first {run.droppedSteps}{" "}
                  {run.droppedSteps === 1 ? "step is" : "steps are"} no longer
                  stored for this conversation.
                </p>
              )}
              {trace.map((event, index) => (
                <button
                  key={`${event.at}-${index}`}
                  type="button"
                  className={`replay-step level-${event.level} ${
                    index === Math.min(stepIndex, lastIndex) ? "current" : ""
                  } ${index > stepIndex ? "future" : ""}`}
                  onClick={() => {
                    setPlaying(false)
                    setStepIndex(index)
                  }}
                >
                  <span className="replay-step-stub" aria-hidden />
                  <span className="replay-step-time">{formatClock(event.at)}</span>
                  <span className="replay-step-title">
                    {event.nodeId
                      ? (nodeNameById.get(event.nodeId) ?? event.title)
                      : event.title}
                  </span>
                  {event.detail && (
                    <span className="replay-step-detail" title={event.detail}>
                      {event.detail}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}

export default ReplayPanel
