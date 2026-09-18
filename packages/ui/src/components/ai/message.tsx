import type { ComponentProps, HTMLAttributes } from "react"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar"
import { cn } from "@workspace/ui/lib/utils"

export type AIMessageProps = HTMLAttributes<HTMLDivElement> & {
  from: "user" | "assistant"
}

export const AIMessage = ({ className, from, ...props }: AIMessageProps) => (
  <div
    className={cn(
      "group flex w-full items-end justify-end gap-2 py-2",
      from === "user" ? "is-user" : "is-assistant flex-row-reverse justify-end",
      "[&>div]:max-w-[80%]",
      className
    )}
    {...props}
  />
)

export type AIMessageContentProps = HTMLAttributes<HTMLDivElement>

export const AIMessageContent = ({
  children,
  className,
  ...props
}: AIMessageContentProps) => (
  <div
    className={cn(
      "break-words",
      "flex flex-col gap-2 rounded-lg border border-border px-3 py-2 text-sm",
      "bg-background text-foreground",
      "group-[.is-user]:border-transparent group-[.is-user]:bg-primary group-[.is-user]:text-primary-foreground",
      "[--ai-response-link-color:currentColor] [--ai-response-link-decoration-color:color-mix(in_srgb,currentColor_72%,transparent)]",
      className
    )}
    {...props}
  >
    <div className="is-user:dark">{children}</div>
  </div>
)

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate()

export type AIMessageTimeProps = HTMLAttributes<HTMLTimeElement> & {
  timestamp: number
}

/**
 * When a message was sent, revealed while its row is hovered (or pressed, on
 * touch screens). Place it before `AIMessageContent` so it sits on the inner
 * side of the bubble for either speaker. Formatted in the viewer's own locale;
 * the tooltip carries the full date and time to the second.
 */
export const AIMessageTime = ({
  timestamp,
  className,
  ...props
}: AIMessageTimeProps) => {
  const date = new Date(timestamp)
  const time = date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  })
  const label = isSameDay(date, new Date())
    ? time
    : `${date.toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        ...(date.getFullYear() === new Date().getFullYear()
          ? {}
          : { year: "numeric" }),
      })}, ${time}`

  return (
    <time
      className={cn(
        "shrink-0 self-center whitespace-nowrap text-[11px] tabular-nums text-muted-foreground",
        "opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-active:opacity-100",
        className
      )}
      dateTime={date.toISOString()}
      title={date.toLocaleString(undefined, {
        dateStyle: "full",
        timeStyle: "medium",
      })}
      {...props}
    >
      {label}
    </time>
  )
}

export type AIMessageAvatarProps = ComponentProps<typeof Avatar> & {
  src: string
  name?: string
}

export const AIMessageAvatar = ({
  src,
  name,
  className,
  ...props
}: AIMessageAvatarProps) => (
  <Avatar className={cn("size-8", className)} {...props}>
    <AvatarImage alt="" className="mt-0 mb-0" src={src} />
    <AvatarFallback>{name?.slice(0, 2) || "ME"}</AvatarFallback>
  </Avatar>
)
