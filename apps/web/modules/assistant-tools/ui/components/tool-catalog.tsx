"use client"

import { Button } from "@workspace/ui/components/button"
import { PlusIcon, SlidersHorizontalIcon } from "lucide-react"
import { useState } from "react"
import type * as React from "react"

import { ConsoleSearch } from "@/modules/dashboard/ui/components/console"
import { ReportFilter } from "@/modules/dashboard/ui/components/report"
import {
  CATALOG_CATEGORIES,
  EFFECT_LABELS,
  FEATURED_BLUEPRINTS,
  TOOL_BLUEPRINTS,
  type CatalogCategoryId,
  type ToolBlueprint,
} from "../../catalog"
import { BlueprintDetailSheet } from "./blueprint-detail-sheet"
import { BlueprintTag, credentialNeed } from "./blueprint-tag"
import { BrandMark, brandStyle } from "./brand-mark"

/**
 * The library: everything the assistant could be doing, findable by vendor
 * name, by job, or by browsing a category.
 *
 * A card never installs blindly from its body — clicking it opens the vendor's
 * detail sheet, where the key it needs and the request it makes are stated.
 * The card's own button is the shortcut for someone who already knows.
 */

type CategoryFilter = CatalogCategoryId | "all"

type ToolCatalogProps = {
  query: string
  onQueryChange: (value: string) => void
  category: CategoryFilter
  onCategoryChange: (value: CategoryFilter) => void
  /** How many installed tools each blueprint accounts for. */
  installedCounts: Record<string, number>
  isGoogleConnected: boolean
  onInstall: (blueprint: ToolBlueprint) => void
  onConfigureBuiltin: (blueprint: ToolBlueprint) => void
  onConnectGoogle: () => void
}

const matchesQuery = (blueprint: ToolBlueprint, query: string) => {
  if (!query) return true

  const haystack = [
    blueprint.title,
    blueprint.vendor,
    blueprint.summary,
    ...blueprint.tags,
  ]
    .join(" ")
    .toLowerCase()

  return haystack.includes(query)
}

/* ── card ───────────────────────────────────────────────────────────────── */

const OfferCard = ({
  blueprint,
  index,
  installedCount,
  isGoogleConnected,
  onOpen,
  onInstall,
  onConfigureBuiltin,
  onConnectGoogle,
}: {
  blueprint: ToolBlueprint
  index: number
  installedCount: number
  isGoogleConnected: boolean
  onOpen: (blueprint: ToolBlueprint) => void
  onInstall: (blueprint: ToolBlueprint) => void
  onConfigureBuiltin: (blueprint: ToolBlueprint) => void
  onConnectGoogle: () => void
}) => {
  const Icon = blueprint.icon
  const isPlanned = blueprint.status === "planned"
  const isIncluded = blueprint.status === "included"
  const needsGoogle = Boolean(blueprint.requiresGoogle) && !isGoogleConnected

  return (
    <article
      className="tools-offer"
      data-planned={isPlanned || undefined}
      style={
        { ...brandStyle(blueprint.brand), "--i": index } as React.CSSProperties
      }
    >
      <button
        aria-label={`${blueprint.title} by ${blueprint.vendor} — see details`}
        className="tools-offer-hit"
        onClick={() => onOpen(blueprint)}
        type="button"
      />

      <div className="flex items-start gap-3">
        <BrandMark brand={blueprint.brand} icon={Icon} muted={isPlanned} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs text-muted-foreground">
            {blueprint.vendor}
          </p>
          <h3 className="mt-0.5 truncate text-[0.95rem] font-medium tracking-[-0.01em] text-foreground">
            {blueprint.title}
          </h3>
        </div>
        <BlueprintTag blueprint={blueprint} installedCount={installedCount} />
      </div>

      <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
        {blueprint.summary}
      </p>

      <div className="mt-auto flex items-end justify-between gap-3 pt-4">
        <p className="min-w-0 text-xs leading-relaxed text-muted-foreground">
          {EFFECT_LABELS[blueprint.effect]}
          {isPlanned ? null : (
            <>
              <span aria-hidden> · </span>
              {credentialNeed(blueprint)}
            </>
          )}
        </p>

        {isPlanned ? null : isIncluded ? (
          <Button
            className="tools-offer-action shrink-0"
            onClick={() => onConfigureBuiltin(blueprint)}
            size="sm"
            type="button"
            variant="outline"
          >
            <SlidersHorizontalIcon data-icon="inline-start" />
            Set up
          </Button>
        ) : needsGoogle ? (
          <Button
            className="tools-offer-action shrink-0"
            onClick={onConnectGoogle}
            size="sm"
            type="button"
            variant="outline"
          >
            Connect Google
          </Button>
        ) : (
          <Button
            aria-label={`Add ${blueprint.title}`}
            className="tools-offer-action shrink-0"
            onClick={() => onInstall(blueprint)}
            size="sm"
            type="button"
            variant="outline"
          >
            <PlusIcon data-icon="inline-start" />
            Add
          </Button>
        )}
      </div>
    </article>
  )
}

/* ── surface ────────────────────────────────────────────────────────────── */

const SectionHeading = ({
  title,
  description,
  count,
}: {
  title: string
  description?: string
  count: number
}) => (
  <div className="mb-4 flex flex-wrap items-end justify-between gap-x-6 gap-y-1">
    <div className="min-w-0">
      <h3 className="report-section-title">{title}</h3>
      {description ? (
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      ) : null}
    </div>
    <span className="text-xs text-muted-foreground tabular-nums">
      {count} {count === 1 ? "tool" : "tools"}
    </span>
  </div>
)

export const ToolCatalog = ({
  query,
  onQueryChange,
  category,
  onCategoryChange,
  installedCounts,
  isGoogleConnected,
  onInstall,
  onConfigureBuiltin,
  onConnectGoogle,
}: ToolCatalogProps) => {
  const [detailBlueprint, setDetailBlueprint] = useState<ToolBlueprint | null>(
    null
  )
  const normalizedQuery = query.trim().toLowerCase()

  const visible = TOOL_BLUEPRINTS.filter(
    (blueprint) =>
      (category === "all" || blueprint.category === category) &&
      matchesQuery(blueprint, normalizedQuery)
  )

  const ready = visible.filter((blueprint) => blueprint.status !== "planned")
  const planned = visible.filter((blueprint) => blueprint.status === "planned")
  const isBrowsingEverything = category === "all" && !normalizedQuery

  const categoryCount = (id: CategoryFilter) =>
    TOOL_BLUEPRINTS.filter(
      (blueprint) =>
        blueprint.status !== "planned" &&
        (id === "all" || blueprint.category === id) &&
        matchesQuery(blueprint, normalizedQuery)
    ).length

  const activeCategory = CATALOG_CATEGORIES.find(
    (entry) => entry.id === category
  )

  const openDetail = (blueprint: ToolBlueprint) => setDetailBlueprint(blueprint)

  const handleInstall = (blueprint: ToolBlueprint) => {
    setDetailBlueprint(null)
    onInstall(blueprint)
  }

  const handleConfigureBuiltin = (blueprint: ToolBlueprint) => {
    setDetailBlueprint(null)
    onConfigureBuiltin(blueprint)
  }

  const handleConnectGoogle = () => {
    setDetailBlueprint(null)
    onConnectGoogle()
  }

  const renderGrid = (blueprints: ToolBlueprint[]) => (
    <div className="tools-offer-grid">
      {blueprints.map((blueprint, index) => (
        <OfferCard
          blueprint={blueprint}
          index={index}
          installedCount={installedCounts[blueprint.id] ?? 0}
          isGoogleConnected={isGoogleConnected}
          key={blueprint.id}
          onConfigureBuiltin={handleConfigureBuiltin}
          onConnectGoogle={handleConnectGoogle}
          onInstall={handleInstall}
          onOpen={openDetail}
        />
      ))}
    </div>
  )

  return (
    <div className="flex flex-col gap-12 pb-10">
      <div className="flex flex-col gap-6">
        <ConsoleSearch
          aria-label="Search the tool library"
          className="tools-search w-full max-w-2xl"
          onChange={onQueryChange}
          placeholder="Search by app or job — “HubSpot”, “book a meeting”, “order status”"
          value={query}
        />

        <div className="border-b border-[var(--report-rule)]">
          <div
            aria-label="Filter the library by category"
            className="report-filters"
            role="group"
          >
            <ReportFilter
              active={category === "all"}
              count={categoryCount("all")}
              onClick={() => onCategoryChange("all")}
            >
              Everything
            </ReportFilter>
            {CATALOG_CATEGORIES.map((entry) => (
              <ReportFilter
                active={category === entry.id}
                count={categoryCount(entry.id)}
                key={entry.id}
                onClick={() => onCategoryChange(entry.id)}
              >
                {entry.label}
              </ReportFilter>
            ))}
          </div>
        </div>
      </div>

      {ready.length === 0 && planned.length === 0 ? (
        <div className="py-6">
          <p className="report-section-title">
            Nothing in the library matches that.
          </p>
          <p className="mt-2 max-w-[60ch] text-sm leading-relaxed text-muted-foreground">
            If the app you use has an API, a developer can still connect it with
            the custom API request tool.
          </p>
          <Button
            className="mt-5"
            onClick={() => {
              onQueryChange("")
              onCategoryChange("all")
            }}
            type="button"
            variant="outline"
          >
            Show everything
          </Button>
        </div>
      ) : null}

      {isBrowsingEverything ? (
        <>
          {FEATURED_BLUEPRINTS.length > 0 ? (
            <section>
              <SectionHeading
                count={Math.min(FEATURED_BLUEPRINTS.length, 6)}
                description="Where most businesses start — each takes a few minutes to set up."
                title="Popular first tools"
              />
              {renderGrid(FEATURED_BLUEPRINTS.slice(0, 6))}
            </section>
          ) : null}

          {CATALOG_CATEGORIES.map((entry) => {
            const items = ready.filter(
              (blueprint) => blueprint.category === entry.id
            )
            if (items.length === 0) return null

            return (
              <section key={entry.id}>
                <SectionHeading
                  count={items.length}
                  description={entry.description}
                  title={entry.label}
                />
                {renderGrid(items)}
              </section>
            )
          })}
        </>
      ) : ready.length > 0 ? (
        <section>
          <SectionHeading
            count={ready.length}
            description={
              normalizedQuery
                ? `Matching “${query.trim()}”${activeCategory ? ` in ${activeCategory.label.toLowerCase()}` : ""}.`
                : activeCategory?.description
            }
            title={
              normalizedQuery
                ? "Results"
                : (activeCategory?.label ?? "Everything")
            }
          />
          {renderGrid(ready)}
        </section>
      ) : null}

      {planned.length > 0 ? (
        <section>
          <SectionHeading
            count={planned.length}
            description="On our roadmap. Listed so you know they're coming — they can't be added yet."
            title="Coming soon"
          />
          {renderGrid(planned)}
        </section>
      ) : null}

      <BlueprintDetailSheet
        blueprint={detailBlueprint}
        installedCount={
          detailBlueprint ? (installedCounts[detailBlueprint.id] ?? 0) : 0
        }
        isGoogleConnected={isGoogleConnected}
        onConfigureBuiltin={handleConfigureBuiltin}
        onConnectGoogle={handleConnectGoogle}
        onInstall={handleInstall}
        onOpenChange={(open) => {
          if (!open) setDetailBlueprint(null)
        }}
        open={detailBlueprint !== null}
      />
    </div>
  )
}
