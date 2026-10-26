"use client"

import { useQuery } from "convex/react"
import { useSearchParams } from "next/navigation"
import { api } from "@workspace/backend/_generated/api"
import {
  CheckCircle2Icon,
  CreditCardIcon,
  ExternalLinkIcon,
} from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import {
  ConsoleHeader,
  ConsolePage,
} from "@/modules/dashboard/ui/components/console"
import { PricingTable } from "../components/pricing-table"

export const BillingView = () => {
  const subscription = useQuery(api.private.subscriptions.getCurrent)
  const searchParams = useSearchParams()
  const checkoutId = searchParams.get("checkout_id")
  const isPro = subscription?.isPro ?? false
  const showCheckoutSuccess = Boolean(checkoutId) && isPro

  return (
    <ConsolePage>
      <ConsoleHeader
        actions={
          subscription ? (
            isPro ? (
              <Button asChild size="sm" variant="outline">
                <a href="/api/polar/portal">
                  <ExternalLinkIcon className="size-3.5" />
                  Invoices and payment
                </a>
              </Button>
            ) : (
              <Button asChild size="sm">
                <a href="/api/polar/checkout">
                  <CreditCardIcon className="size-3.5" />
                  Upgrade to Pro
                </a>
              </Button>
            )
          ) : null
        }
        description={
          isPro
            ? "You have every premium feature. Invoices and payment methods live in the Polar portal."
            : "Start free and move to Pro when you need voice, knowledge base training and analytics."
        }
        title="Plans & billing"
      />

      {showCheckoutSuccess ? (
        <div className="report-panel console-tone-positive flex items-start gap-3 px-4 py-3.5">
          <CheckCircle2Icon className="mt-0.5 size-4 shrink-0" />
          <div>
            <p className="text-sm font-medium text-foreground">
              Upgrade successful
            </p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Your Pro subscription is active. Manage invoices and payment
              methods in the Polar customer portal.
            </p>
          </div>
        </div>
      ) : null}

      <PricingTable subscription={subscription} />
    </ConsolePage>
  )
}
