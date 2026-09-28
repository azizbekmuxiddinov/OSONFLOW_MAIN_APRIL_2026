import { cronJobs } from "convex/server"

import { internal } from "./_generated/api"

const crons = cronJobs()

// Uploads that were never sent hold a blob nothing references. Sweeping them
// keeps an abandoned composer from accumulating storage indefinitely.
crons.interval(
  "sweep orphaned chat attachments",
  { hours: 6 },
  internal.system.chatAttachments.sweepOrphans,
  {}
)

// Developer API request logs past each organization's retention period, and
// daily usage counters older than the usage chart shows.
crons.interval(
  "purge developer API logs",
  { hours: 1 },
  internal.system.developerApi.gate.purgeExpired,
  {}
)

// The week in one Telegram message for every team that asked for it, then the
// questions customers asked that the assistant could not answer — each one
// answerable by replying. 04:00 UTC is 09:00 in Tashkent.
crons.weekly(
  "weekly team digest",
  { dayOfWeek: "monday", hourUTC: 4, minuteUTC: 0 },
  (internal as any).system.teamAlerts.sendWeeklyDigests,
  {}
)

export default crons
