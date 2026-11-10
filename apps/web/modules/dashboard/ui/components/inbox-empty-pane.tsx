import type * as React from "react"

/**
 * What the right-hand pane of an inbox shows before anything is picked, and
 * the small empty state at the top of an inbox list. Chat and voice share
 * them so the two inboxes read as one product.
 */

type IconType = React.ComponentType<{ className?: string }>

export const InboxKey = ({ children }: { children: React.ReactNode }) => (
  <kbd className="inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-[5px] bg-background px-1 font-sans text-[10px] font-medium text-muted-foreground shadow-[0_0_0_1px_rgb(0_0_0/0.09),0_1px_0_rgb(0_0_0/0.08)] dark:bg-white/10 dark:shadow-[0_0_0_1px_rgb(255_255_255/0.1)]">
    {children}
  </kbd>
)

export const InboxEmptyPane = ({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: IconType
  title: string
  description: string
  /** Shortcut hints shown under the description. */
  children?: React.ReactNode
}) => (
  <div className="dash-rise flex h-full w-full flex-col items-center justify-center bg-background p-6">
    <div className="flex max-w-[26rem] flex-col items-center text-center">
      <span className="dash-empty-mark">
        <Icon className="size-5" />
      </span>
      <p className="mt-5 text-[0.9375rem] font-semibold tracking-[-0.01em] text-foreground">
        {title}
      </p>
      <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-pretty text-muted-foreground">
        {description}
      </p>
      {children ? (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
          {children}
        </div>
      ) : null}
    </div>
  </div>
)

export const InboxListEmpty = ({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: IconType
  title: string
  description: string
  action?: React.ReactNode
}) => (
  <div className="dash-rise mx-auto mt-12 flex max-w-[230px] flex-col items-center text-center">
    <span className="dash-empty-mark size-10!">
      <Icon className="size-[18px]" />
    </span>
    <p className="mt-4 text-[0.8125rem] font-semibold text-foreground">
      {title}
    </p>
    <p className="mt-1 text-xs leading-relaxed text-pretty text-muted-foreground">
      {description}
    </p>
    {action ? <div className="mt-3.5">{action}</div> : null}
  </div>
)
