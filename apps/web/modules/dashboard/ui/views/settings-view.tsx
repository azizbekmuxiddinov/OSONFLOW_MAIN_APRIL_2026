"use client"

import Link from "next/link"
import {
  ArrowLeftRightIcon,
  BellRingIcon,
  BookOpenIcon,
  BracesIcon,
  Building2Icon,
  CircleUserIcon,
  CreditCardIcon,
  GitBranchIcon,
  GraduationCapIcon,
  LayoutGridIcon,
  MegaphoneIcon,
  PaletteIcon,
  WandSparklesIcon,
  WrenchIcon,
  type LucideIcon,
} from "lucide-react"

import { ConsoleHeader, ConsolePage } from "../components/console"

/**
 * Settings home, laid out like Intercom's: every setting the owner might look
 * for, grouped, each a tile with a coloured mark so the groups read at a glance.
 */

type Tile = {
  title: string
  description: string
  href: string
  icon: LucideIcon
}

type Group = {
  title: string
  /** Hue of the group's marks; one per group, like Intercom's settings home. */
  hue: string
  tiles: Tile[]
}

const GROUPS: Group[] = [
  {
    title: "Channels",
    hue: "#e5578f",
    tiles: [
      {
        title: "Widget",
        description: "How the chat on your website looks, talks and behaves.",
        href: "/customization",
        icon: PaletteIcon,
      },
      {
        title: "Integrations",
        description: "Website code, Telegram, Instagram and WhatsApp.",
        href: "/integrations",
        icon: LayoutGridIcon,
      },
      {
        title: "Follow-ups",
        description: "Check in when customers go quiet, and send broadcasts.",
        href: "/follow-ups",
        icon: MegaphoneIcon,
      },
    ],
  },
  {
    title: "AI assistant",
    hue: "#7c5cf2",
    tiles: [
      {
        title: "Knowledge",
        description: "The documents and pages your assistant answers from.",
        href: "/files",
        icon: BookOpenIcon,
      },
      {
        title: "Answers",
        description: "Approve or correct replies for questions it missed.",
        href: "/teach",
        icon: GraduationCapIcon,
      },
      {
        title: "Tools",
        description: "Apps your assistant can use while it chats.",
        href: "/assistant-tools",
        icon: WrenchIcon,
      },
      {
        title: "Workflows",
        description: "Conversations you plan step by step.",
        href: "/workflows",
        icon: GitBranchIcon,
      },
      {
        title: "Set up with AI",
        description: "Point it at your website and review what it writes.",
        href: "/ai-setup",
        icon: WandSparklesIcon,
      },
    ],
  },
  {
    title: "Your team",
    hue: "#2f80ed",
    tiles: [
      {
        title: "Telegram alerts",
        description: "Tell your team when a customer needs a person.",
        href: "/team-alerts",
        icon: BellRingIcon,
      },
      {
        title: "Organization",
        description: "Name, logo and the people in your workspace.",
        href: "/organization-settings",
        icon: Building2Icon,
      },
    ],
  },
  {
    title: "Workspace",
    hue: "#e8833a",
    tiles: [
      {
        title: "Plans & billing",
        description: "Your plan, invoices and payment method.",
        href: "/billing",
        icon: CreditCardIcon,
      },
      {
        title: "Data transfer",
        description: "Copy this setup into another organization.",
        href: "/org-transfer",
        icon: ArrowLeftRightIcon,
      },
      {
        title: "Developer API",
        description: "Keys, usage and request logs for your developers.",
        href: "/developers",
        icon: BracesIcon,
      },
    ],
  },
  {
    title: "Personal",
    hue: "#20a77b",
    tiles: [
      {
        title: "Your account",
        description: "Name, email, password and how you sign in.",
        href: "/account",
        icon: CircleUserIcon,
      },
    ],
  },
]

export const SettingsView = () => (
  <ConsolePage className="max-w-5xl">
    <ConsoleHeader title="Settings" />

    <div className="flex flex-col gap-8">
      {GROUPS.map((group, index) => (
        <section
          className={
            index > 0
              ? "border-t border-[var(--console-hairline-soft)] pt-7"
              : undefined
          }
          key={group.title}
        >
          <h2 className="mb-3.5 text-[0.9375rem] font-semibold">
            {group.title}
          </h2>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {group.tiles.map((tile) => (
              <li key={tile.href}>
                <Link
                  className="flex h-full items-start gap-3 rounded-[10px] border border-[var(--console-hairline)] bg-card px-3.5 py-3.5 transition-[border-color,box-shadow] hover:border-[color-mix(in_srgb,var(--foreground)_18%,transparent)] hover:shadow-[0_2px_6px_rgb(0_0_0/0.05)]"
                  href={tile.href}
                >
                  <span
                    className="flex size-8 shrink-0 items-center justify-center rounded-lg"
                    style={{
                      background: `color-mix(in srgb, ${group.hue} 16%, var(--card))`,
                      color: `color-mix(in srgb, ${group.hue} 85%, var(--foreground))`,
                    }}
                  >
                    <tile.icon className="size-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[0.8125rem] font-medium">
                      {tile.title}
                    </span>
                    <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">
                      {tile.description}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  </ConsolePage>
)
