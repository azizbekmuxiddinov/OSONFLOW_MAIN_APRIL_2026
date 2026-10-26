import {
  ArrowLeftRightIcon,
  AtSignIcon,
  CircleCheckIcon,
  CircleDotIcon,
  FlagIcon,
  HandIcon,
  UserRoundXIcon,
  BellRingIcon,
  BookOpenIcon,
  BracesIcon,
  BrainIcon,
  Building2Icon,
  ChartColumnBigIcon,
  CircleUserIcon,
  CreditCardIcon,
  GitBranchIcon,
  GraduationCapIcon,
  HouseIcon,
  InboxIcon,
  LayoutGridIcon,
  MegaphoneIcon,
  MonitorSmartphoneIcon,
  PaletteIcon,
  PhoneIcon,
  SettingsIcon,
  SparklesIcon,
  UserPlusIcon,
  UsersIcon,
  WandSparklesIcon,
  WrenchIcon,
  type LucideIcon,
} from "lucide-react"

import type { ConversationView } from "../../hooks/use-conversation-view"

/**
 * The dashboard's map, Intercom-style: an icon rail of areas, and for each area
 * a sidebar of its pages. Area names say what the owner is doing; page names
 * match the title on the page itself.
 */

export type NavItem = {
  title: string
  url: string
  icon: LucideIcon
  /** An inbox view: the item filters the conversation list instead of navigating away. */
  view?: ConversationView
}

export type NavSection = {
  label?: string
  items: NavItem[]
}

export type NavArea = {
  id: string
  label: string
  icon: LucideIcon
  href: string
  /** Paths that belong to this area. */
  match: string[]
  sections: NavSection[]
  /** Pinned to the bottom of the rail. */
  bottom?: boolean
}

export const NAV_AREAS: NavArea[] = [
  {
    id: "home",
    label: "Home",
    icon: HouseIcon,
    href: "/home",
    match: ["/home", "/start"],
    sections: [],
  },
  {
    id: "inbox",
    label: "Inbox",
    icon: InboxIcon,
    href: "/conversations",
    match: ["/conversations", "/ai-conversations", "/follow-ups"],
    sections: [
      {
        items: [
          { title: "All conversations", url: "/conversations", icon: InboxIcon, view: "all" },
          { title: "Open", url: "/conversations", icon: CircleDotIcon, view: "unresolved" },
          { title: "Waiting for you", url: "/conversations", icon: HandIcon, view: "escalated" },
          { title: "Mine", url: "/conversations", icon: AtSignIcon, view: "assigned_to_me" },
          { title: "Unassigned", url: "/conversations", icon: UserRoundXIcon, view: "unassigned" },
          { title: "Resolved", url: "/conversations", icon: CircleCheckIcon, view: "resolved" },
        ],
      },
      {
        label: "AI assistant",
        items: [
          { title: "Answered by the assistant", url: "/conversations", icon: SparklesIcon, view: "widget" },
          { title: "From workflows", url: "/conversations", icon: GitBranchIcon, view: "workflow" },
          { title: "With a priority", url: "/conversations", icon: FlagIcon, view: "prioritized" },
        ],
      },
      {
        label: "Channels",
        items: [
          { title: "Voice calls", url: "/ai-conversations", icon: PhoneIcon },
          { title: "Follow-ups", url: "/follow-ups", icon: MegaphoneIcon },
        ],
      },
    ],
  },
  {
    id: "assistant",
    label: "AI assistant",
    icon: SparklesIcon,
    href: "/files",
    match: ["/files", "/teach", "/assistant-tools", "/workflows", "/ai-setup"],
    sections: [
      {
        label: "Train",
        items: [
          { title: "Knowledge", url: "/files", icon: BookOpenIcon },
          { title: "Answers", url: "/teach", icon: GraduationCapIcon },
          { title: "Set up with AI", url: "/ai-setup", icon: WandSparklesIcon },
        ],
      },
      {
        label: "Act",
        items: [
          { title: "Tools", url: "/assistant-tools", icon: WrenchIcon },
          { title: "Workflows", url: "/workflows", icon: GitBranchIcon },
        ],
      },
    ],
  },
  {
    id: "contacts",
    label: "Contacts",
    icon: UsersIcon,
    href: "/leads",
    match: ["/leads", "/customer-memory"],
    sections: [
      {
        label: "People",
        items: [
          { title: "Leads", url: "/leads", icon: UserPlusIcon },
          { title: "Customer memory", url: "/customer-memory", icon: BrainIcon },
        ],
      },
    ],
  },
  {
    id: "reports",
    label: "Reports",
    icon: ChartColumnBigIcon,
    href: "/analytics",
    match: ["/analytics"],
    sections: [
      {
        items: [{ title: "Analytics", url: "/analytics", icon: ChartColumnBigIcon }],
      },
    ],
  },
  {
    id: "channels",
    label: "Channels",
    icon: MonitorSmartphoneIcon,
    href: "/customization",
    match: ["/customization", "/integrations", "/team-alerts"],
    sections: [
      {
        label: "Put it on your website",
        items: [
          { title: "Widget", url: "/customization", icon: PaletteIcon },
          { title: "Integrations", url: "/integrations", icon: LayoutGridIcon },
        ],
      },
      {
        label: "Your team",
        items: [{ title: "Telegram alerts", url: "/team-alerts", icon: BellRingIcon }],
      },
    ],
  },
  {
    id: "settings",
    label: "Settings",
    icon: SettingsIcon,
    href: "/settings",
    match: [
      "/settings",
      "/billing",
      "/developers",
      "/org-transfer",
      "/organization-settings",
      "/account",
    ],
    bottom: true,
    sections: [
      {
        items: [{ title: "All settings", url: "/settings", icon: SettingsIcon }],
      },
      {
        label: "Workspace",
        items: [
          { title: "Organization", url: "/organization-settings", icon: Building2Icon },
          { title: "Plans & billing", url: "/billing", icon: CreditCardIcon },
          { title: "Data transfer", url: "/org-transfer", icon: ArrowLeftRightIcon },
        ],
      },
      {
        label: "Developers",
        items: [{ title: "Developer API", url: "/developers", icon: BracesIcon }],
      },
      {
        label: "Personal",
        items: [{ title: "Your account", url: "/account", icon: CircleUserIcon }],
      },
    ],
  },
]

export const areaForPath = (pathname: string) =>
  NAV_AREAS.find((area) =>
    area.match.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
    )
  ) ?? NAV_AREAS[0]!
