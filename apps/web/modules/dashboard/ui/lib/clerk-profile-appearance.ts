/**
 * Clerk's profile screens (Organization, Your account) drawn as part of the
 * dashboard: one flat hairline panel the width of the page, instead of a
 * floating card with its own drop shadow.
 */
export const clerkProfileAppearance = {
  elements: {
    rootBox: "w-full!",
    cardBox:
      "w-full! max-w-none! rounded-xl! border! border-[var(--console-hairline)]! shadow-none! min-h-[min(34rem,70svh)]!",
    navbar:
      // The page's own top bar already names the screen, so Clerk's repeat of
      // the title above its menu is hidden.
      "bg-[color-mix(in_srgb,var(--canvas)_55%,var(--background))]! border-r! border-[var(--console-hairline-soft)]! [background-image:none]! [&_h1]:hidden! [&_h1+p]:hidden!",
    navbarButton: "rounded-lg! text-[13px]!",
    scrollBox: "rounded-none! shadow-none! bg-background!",
    pageScrollBox: "px-6! py-6! md:px-8!",
    headerTitle: "text-[1rem]! font-semibold! tracking-[-0.012em]!",
    profileSectionTitleText: "text-[13px]! font-medium!",
    footer: "[background-image:none]! bg-transparent!",
  },
} as const
