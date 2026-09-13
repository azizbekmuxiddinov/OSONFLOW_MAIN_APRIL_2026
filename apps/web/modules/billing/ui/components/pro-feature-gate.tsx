"use client"

import { useQuery } from "convex/react"
import { api } from "@workspace/backend/_generated/api"

import { PremiumFeatureOverlay } from "./premium-feature-overlay"

type ProFeatureGateProps = {
  children: React.ReactNode
  /** Shown while the subscription loads, instead of an empty page. */
  fallback?: React.ReactNode
}

export const ProFeatureGate = ({
  children,
  fallback = null,
}: ProFeatureGateProps) => {
  const subscription = useQuery(api.private.subscriptions.getCurrent)

  if (subscription === undefined) {
    return <>{fallback}</>
  }

  if (!subscription.isActive) {
    return <PremiumFeatureOverlay>{children}</PremiumFeatureOverlay>
  }

  return <>{children}</>
}
