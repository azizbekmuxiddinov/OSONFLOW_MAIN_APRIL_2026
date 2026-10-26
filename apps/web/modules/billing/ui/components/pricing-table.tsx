"use client"

import { CheckIcon, CreditCardIcon, ExternalLinkIcon, MinusIcon } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { cn } from "@workspace/ui/lib/utils"

type SubscriptionState = {
  isActive: boolean
  isPro: boolean
  status: string | null
  provider: string | null
  currentPeriodEnd: number | null
} | undefined

type PricingTableProps = {
  subscription: SubscriptionState
}

/** What each plan includes, row by row, the way billing pages compare plans. */
const PLAN_ROWS: { feature: string; free: boolean; pro: boolean }[] = [
  { feature: "Support inbox and website chat widget", free: true, pro: true },
  { feature: "Knowledge base files and website training", free: false, pro: true },
  { feature: "AI voice support", free: false, pro: true },
  { feature: "Premium integrations", free: false, pro: true },
  { feature: "Customer memory and analytics", free: false, pro: true },
  { feature: "Team-ready organization billing", free: false, pro: true },
]

const formatDate = (timestamp: number | null) => {
  if (!timestamp) {
    return null
  }

  return new Intl.DateTimeFormat(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(timestamp))
}

const formatStatusLabel = (status: string | null) => {
  switch (status) {
    case "active":
      return "Active"
    case "trialing":
      return "Trial"
    case "past_due":
      return "Past due"
    case "canceled":
      return "Canceled"
    default:
      return status ? status.replaceAll("_", " ") : "Inactive"
  }
}

/** The account's plan in four figures, then the plan comparison. */
export const PricingTable = ({ subscription }: PricingTableProps) => {
  if (subscription === undefined) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-24 rounded-[14px]" />
        <Skeleton className="h-80 rounded-[14px]" />
      </div>
    )
  }

  const isPro = subscription.isPro
  const periodEnd = formatDate(subscription.currentPeriodEnd)
  const isPastDue = subscription.status === "past_due"
  const isCanceled = subscription.status === "canceled"

  return (
    <div className="flex flex-col gap-5">
      <section className="report-strip grid grid-cols-2 lg:grid-cols-4">
        <Cell label="Plan" value={isPro ? "Pro" : "Free"} />
        <Cell
          label="Status"
          tone={isPastDue ? "critical" : isPro ? "positive" : "neutral"}
          value={isPro ? formatStatusLabel(subscription.status) : "Free forever"}
        />
        <Cell
          label={isCanceled ? "Access ends" : "Renews on"}
          value={isPro && periodEnd ? periodEnd : "—"}
        />
        <Cell
          label="Price"
          value={
            <>
              {isPro ? "$29.99" : "$0"}
              <span className="ml-1 text-sm font-normal text-muted-foreground">
                / month
              </span>
            </>
          }
        />
      </section>

      {isPastDue ? (
        <p className="report-panel px-4 py-3 text-[0.8125rem] text-[var(--console-critical)] sm:px-5">
          Your last payment did not go through. Update your card in Polar to
          keep Pro features running.
        </p>
      ) : null}

      <section className="report-panel overflow-x-auto">
        <table className="w-full min-w-[560px] border-collapse text-[0.8125rem]">
          <thead>
            <tr className="border-b border-[var(--console-hairline-soft)] align-bottom">
              <th className="px-4 py-4 text-left font-normal sm:px-5">
                <span className="console-label">Compare plans</span>
              </th>
              <PlanHeading
                current={!isPro}
                name="Free"
                note="The core support inbox and widget."
                price="$0"
              />
              <PlanHeading
                current={isPro}
                name="Pro"
                note="Billed through Polar. Cancel anytime."
                price="$29.99"
              />
            </tr>
          </thead>
          <tbody>
            {PLAN_ROWS.map((row) => (
              <tr
                className="border-b border-[var(--console-hairline-soft)] last:border-b-0"
                key={row.feature}
              >
                <td className="px-4 py-2.5 sm:px-5">{row.feature}</td>
                <Included value={row.free} />
                <Included value={row.pro} />
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-[var(--console-hairline-soft)]">
              <td className="px-4 py-3.5 text-xs text-muted-foreground sm:px-5">
                Polar handles checkout, tax, receipts and invoices.
              </td>
              <td className="px-4 py-3.5" />
              <td className="px-4 py-3.5">
                {isPro ? (
                  <Button asChild size="sm" variant="outline">
                    <a href="/api/polar/portal">
                      <ExternalLinkIcon className="size-3.5" />
                      Manage billing
                    </a>
                  </Button>
                ) : (
                  <Button asChild size="sm">
                    <a href="/api/polar/checkout">
                      <CreditCardIcon className="size-3.5" />
                      Upgrade to Pro
                    </a>
                  </Button>
                )}
              </td>
            </tr>
          </tfoot>
        </table>
      </section>
    </div>
  )
}

const Cell = ({
  label,
  value,
  tone = "neutral",
}: {
  label: string
  value: React.ReactNode
  tone?: "neutral" | "positive" | "critical"
}) => (
  <div className="flex min-w-0 flex-col gap-2 px-4 py-3.5 sm:px-5">
    <span className="console-label">{label}</span>
    <span
      className={cn(
        "console-numeral truncate text-xl leading-none",
        tone === "positive" && "text-[var(--console-positive)]",
        tone === "critical" && "text-[var(--console-critical)]"
      )}
    >
      {value}
    </span>
  </div>
)

const PlanHeading = ({
  name,
  price,
  note,
  current,
}: {
  name: string
  price: string
  note: string
  current: boolean
}) => (
  <th className="w-[28%] px-4 py-4 text-left align-bottom font-normal">
    <div className="flex items-center gap-2">
      <span className="text-sm font-semibold">{name}</span>
      {current ? (
        <span className="rounded-full bg-foreground px-2 py-0.5 text-[10px] font-medium text-background">
          Current
        </span>
      ) : null}
    </div>
    <p className="mt-1.5">
      <span className="console-numeral text-2xl">{price}</span>
      <span className="text-xs text-muted-foreground"> / month</span>
    </p>
    <p className="mt-1 text-xs text-muted-foreground">{note}</p>
  </th>
)

const Included = ({ value }: { value: boolean }) => (
  <td className="px-4 py-2.5">
    {value ? (
      <CheckIcon aria-label="Included" className="size-4 text-foreground" />
    ) : (
      <MinusIcon
        aria-label="Not included"
        className="size-4 text-muted-foreground/50"
      />
    )}
  </td>
)
