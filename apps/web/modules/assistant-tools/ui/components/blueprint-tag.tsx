"use client"

import type { ToolBlueprint } from "../../catalog"

/** What the card says about keys, in words an owner would use. */
export const credentialNeed = (blueprint: ToolBlueprint) => {
  if (blueprint.requiresGoogle || blueprint.auth?.kind === "google_oauth") {
    return "Uses your Google account"
  }
  if (!blueprint.auth || blueprint.auth.kind === "none") return "No key needed"
  if (blueprint.auth.kind === "secret_url") return "Needs a private link"
  return "Needs an API key"
}

export const BlueprintTag = ({
  blueprint,
  installedCount,
}: {
  blueprint: ToolBlueprint
  installedCount: number
}) => {
  if (blueprint.status === "planned") {
    return <span className="tools-tag">Coming soon</span>
  }
  if (blueprint.status === "included") {
    return (
      <span className="tools-tag" data-tone="positive">
        Included
      </span>
    )
  }
  if (installedCount > 0) {
    return (
      <span className="tools-tag" data-tone="positive">
        Added{installedCount > 1 ? ` ×${installedCount}` : ""}
      </span>
    )
  }
  return null
}
