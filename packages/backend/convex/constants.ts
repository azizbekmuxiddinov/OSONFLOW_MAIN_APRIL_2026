export const SESSION_DURATION_MS = 24*60*60*1000

// The longest single message the unauthenticated widget will accept from a
// visitor. Every message is sent to a paid model and the whole thread is
// re-sent on each turn, so an uncapped field lets one visitor drive arbitrary
// model spend. The developer API has its own, per-key `maxMessageChars`
// instead of this. Generous enough for a long paste; a hard ceiling, not a UX
// hint (the composer stops typing well before this).
export const MAX_WIDGET_MESSAGE_LENGTH = 8000