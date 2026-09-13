"use client"

import { Button } from "@workspace/ui/components/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@workspace/ui/components/sheet"
import {
  ArrowRightIcon,
  CheckIcon,
  ExternalLinkIcon,
  SlidersHorizontalIcon,
} from "lucide-react"
import { useMemo } from "react"
import type * as React from "react"

import {
  CATALOG_CATEGORY_LABELS,
  EFFECT_LABELS,
  type ToolBlueprint,
} from "../../catalog"
import { AUTH_KIND_LABELS } from "../../lib/tool-auth"
import { BrandMark } from "./brand-mark"
import { RequestPreview } from "./request-preview"
import { BlueprintTag, credentialNeed } from "./blueprint-tag"
import { Callout, Disclosure } from "./tools-primitives"

/**
 * The vendor page for one offering.
 *
 * Everything an owner needs before they commit: what the tool does, which key
 * it will ask for, what the assistant gets to send, and — for a developer — the
 * exact request that leaves the network. Adding it is the last step here, not
 * the first thing you are pushed into.
 */

type BlueprintDetailSheetProps = {
  blueprint: ToolBlueprint | null
  open: boolean
  onOpenChange: (open: boolean) => void
  installedCount: number
  isGoogleConnected: boolean
  onInstall: (blueprint: ToolBlueprint) => void
  onConfigureBuiltin: (blueprint: ToolBlueprint) => void
  onConnectGoogle: () => void
}

const Section = ({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) => (
  <section className="border-t border-[var(--report-rule)] py-6">
    <h3 className="console-label mb-3">{title}</h3>
    {children}
  </section>
)

export const BlueprintDetailSheet = ({
  blueprint,
  open,
  onOpenChange,
  installedCount,
  isGoogleConnected,
  onInstall,
  onConfigureBuiltin,
  onConnectGoogle,
}: BlueprintDetailSheetProps) => {
  const draft = useMemo(() => blueprint?.draft?.() ?? null, [blueprint])

  if (!blueprint) {
    return null
  }

  const Icon = blueprint.icon
  const isPlanned = blueprint.status === "planned"
  const isIncluded = blueprint.status === "included"
  const needsGoogle = Boolean(blueprint.requiresGoogle) && !isGoogleConnected
  const channels = isIncluded
    ? blueprint.tags.find((tag) => /chat|voice/i.test(tag))
    : draft?.enabledForVoice
      ? "Chat & voice"
      : "Chat"

  return (
    <Sheet onOpenChange={onOpenChange} open={open}>
      {/* Portaled to <body>: the page classes carry the report tokens here. */}
      <SheetContent
        className="report setup tools w-full gap-0 p-0 sm:max-w-xl"
        side="right"
      >
        <SheetHeader className="gap-0 px-6 pt-7 pb-6">
          <div className="flex items-center gap-4 pr-8">
            <BrandMark
              brand={blueprint.brand}
              icon={Icon}
              muted={isPlanned}
              size="xl"
            />
            <div className="min-w-0">
              <p className="truncate text-sm text-muted-foreground">
                {blueprint.vendor}
              </p>
              <SheetTitle className="mt-0.5 text-[1.35rem] leading-tight font-semibold tracking-[-0.02em]">
                {blueprint.title}
              </SheetTitle>
            </div>
          </div>
          <SheetDescription className="report-lede mt-5">
            {blueprint.summary}
          </SheetDescription>

          <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-xs text-muted-foreground">Does</dt>
              <dd className="mt-0.5 font-medium text-foreground">
                {EFFECT_LABELS[blueprint.effect]}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Category</dt>
              <dd className="mt-0.5 font-medium text-foreground">
                {CATALOG_CATEGORY_LABELS[blueprint.category]}
              </dd>
            </div>
            {channels ? (
              <div>
                <dt className="text-xs text-muted-foreground">Works on</dt>
                <dd className="mt-0.5 font-medium text-foreground">
                  {channels}
                </dd>
              </div>
            ) : null}
          </dl>

          {isPlanned || isIncluded || installedCount > 0 ? (
            <div className="mt-5 flex">
              <BlueprintTag
                blueprint={blueprint}
                installedCount={installedCount}
              />
            </div>
          ) : null}
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-6">
          {isPlanned ? (
            <Callout className="mb-6">
              This one isn&apos;t available yet, so it can&apos;t be added.
              It&apos;s listed because it&apos;s on our roadmap.
            </Callout>
          ) : null}

          {blueprint.highlights?.length ? (
            <Section title="What it does">
              <ul className="space-y-2.5">
                {blueprint.highlights.map((highlight) => (
                  <li className="flex items-start gap-3" key={highlight}>
                    <CheckIcon
                      aria-hidden
                      className="mt-0.5 size-4 shrink-0 text-[var(--outcome-resolved)]"
                    />
                    <span className="text-sm leading-relaxed text-foreground">
                      {highlight}
                    </span>
                  </li>
                ))}
              </ul>
            </Section>
          ) : null}

          {!isIncluded && !isPlanned ? (
            <Section title="What you'll need">
              <p className="text-sm font-medium text-foreground">
                {blueprint.auth && blueprint.auth.kind !== "none"
                  ? blueprint.auth.label
                  : credentialNeed(blueprint)}
              </p>
              {blueprint.auth?.hint ? (
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {blueprint.auth.hint}
                </p>
              ) : null}
              {blueprint.setupHint ? (
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {blueprint.setupHint}
                </p>
              ) : null}
              {blueprint.auth?.docsUrl ? (
                <a
                  className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-foreground underline underline-offset-4"
                  href={blueprint.auth.docsUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  Where to find it
                  <ExternalLinkIcon aria-hidden className="size-3.5" />
                </a>
              ) : null}
            </Section>
          ) : null}

          {draft && draft.parameters.length > 0 ? (
            <Section title="What the assistant sends">
              <ul>
                {draft.parameters.map((parameter) => (
                  <li
                    className="tools-field grid grid-cols-[minmax(0,9rem)_minmax(0,1fr)] gap-4 py-2.5"
                    key={parameter.name}
                  >
                    <code className="truncate pt-px font-mono text-xs font-medium text-foreground">
                      {parameter.name}
                    </code>
                    <span className="text-sm leading-snug text-muted-foreground">
                      {parameter.description}
                      {parameter.required ? null : (
                        <span className="text-xs"> (optional)</span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </Section>
          ) : null}

          {draft &&
          draft.type !== "google_sheets" &&
          draft.type !== "google_calendar" ? (
            <div className="border-t border-[var(--report-rule)]">
              <Disclosure summary="For developers: the request it makes">
                <div className="space-y-3">
                  {blueprint.auth ? (
                    <p className="text-xs text-muted-foreground">
                      Signs in with: {AUTH_KIND_LABELS[blueprint.auth.kind]}
                    </p>
                  ) : null}
                  <RequestPreview
                    config={draft.config}
                    parameters={draft.parameters}
                    type={draft.type}
                  />
                </div>
              </Disclosure>
            </div>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center justify-between gap-3 border-t border-[var(--report-rule)] px-6 py-4">
          {blueprint.docsUrl ? (
            <a
              className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
              href={blueprint.docsUrl}
              rel="noreferrer"
              target="_blank"
            >
              {blueprint.vendor} docs
              <ExternalLinkIcon aria-hidden className="size-3.5" />
            </a>
          ) : (
            <span />
          )}

          {isPlanned ? (
            <Button
              onClick={() => onOpenChange(false)}
              type="button"
              variant="outline"
            >
              Close
            </Button>
          ) : isIncluded ? (
            <Button onClick={() => onConfigureBuiltin(blueprint)} type="button">
              <SlidersHorizontalIcon data-icon="inline-start" />
              Set it up
            </Button>
          ) : needsGoogle ? (
            <Button onClick={onConnectGoogle} type="button">
              Connect Google first
              <ArrowRightIcon data-icon="inline-end" />
            </Button>
          ) : (
            <Button onClick={() => onInstall(blueprint)} type="button">
              {installedCount > 0 ? "Add another" : "Add to my assistant"}
              <ArrowRightIcon data-icon="inline-end" />
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
