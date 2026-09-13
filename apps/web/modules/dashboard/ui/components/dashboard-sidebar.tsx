"use client"

import { OrganizationSwitcher, UserButton, useAuth } from "@clerk/nextjs"

import {
  ArrowLeftRightIcon,
  BookOpen,
  BotMessageSquare,
  BrainIcon,
  ChartColumnBig,
  CompassIcon,
  CreditCardIcon,
  GitBranchIcon,
  LayoutDashboardIcon,
  MessagesSquare,
  PaletteIcon,
  UserPlusIcon,
  WrenchIcon,
  type LucideIcon,
} from "lucide-react"
import { motion } from "framer-motion"

import Link from "next/link"

import { usePathname } from "next/navigation"
import * as React from "react"
import { useCallback, useEffect } from "react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@workspace/ui/components/sidebar"

import { LanguageSwitcher } from "@/components/i18n/language-switcher"
import { DashboardThemeToggle } from "./dashboard-theme-toggle"
import { useMutation, useQuery } from "convex/react"
import { api } from "@workspace/backend/_generated/api"

const customerSupportItems = [
  {
    title: "Conversations",
    url: "/conversations",
    icon: MessagesSquare,
  },
  {
    title: "Leads",
    url: "/leads",
    icon: UserPlusIcon,
  },
  {
    title: "AI voicechats",
    url: "/ai-conversations",
    icon: BotMessageSquare,
  },
  {
    title: "Analytics",
    url: "/analytics",
    icon: ChartColumnBig,
  },
  {
    title: "Customer memory",
    url: "/customer-memory",
    icon: BrainIcon,
  },

  {
    title: "Knowledge base",
    url: "/files",
    icon: BookOpen,
  },
]
const configurationItems = [
  {
    title: "Widget customization",
    url: "/customization",
    icon: PaletteIcon,
  },
  {
    title: "Assistant tools",
    url: "/assistant-tools",
    icon: WrenchIcon,
  },
  {
    title: "Integrations",
    url: "/integrations",
    icon: LayoutDashboardIcon,
  },
  {
    title: "Workflows",
    url: "/workflows",
    icon: GitBranchIcon,
  },
  {
    title: "Data transfer",
    url: "/org-transfer",
    icon: ArrowLeftRightIcon,
  },
]

const accountsItem = [
  {
    title: "Plans & Billing",
    url: "/billing",
    icon: CreditCardIcon,
  },
]

const organizationSwitcherAppearance = {
  elements: {
    rootBox: "w-full! h-8!",
    avatarBox: "size-4! rounded-sm!",
    organizationSwitcherTrigger:
      "w-full! justify-start! group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2!",
    organizationPreview: "group-data-[collapsible=icon]:justify-center! gap-2!",
    organizationPreviewTextContainer:
      "group-data-[collapsible=icon]:hidden! text-xs! font-medium! text-sidebar-foreground!",
    organizationSwitcherTriggerIcon:
      "group-data-[collapsible=icon]:hidden! ml-auto! text-sidebar-foreground!",
  },
}

const userButtonAppearance = {
  elements: {
    rootBox: "w-full! h-8!",
    userButtonTrigger:
      "w-full! p-2! hover:bg-sidebar-accent! hover:text-sidebar-accent-foreground! group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2!",
    userButtonBox:
      "w-full! flex-row-reverse! justify-end! gap-2! group-data-[collapsible=icon]:justify-center! text-sidebar-foreground!",
    userButtonOuterIdentifier: "pl-0! group-data-[collapsible=icon]:hidden!",
    avatarBox: "size-4!",
  },
}

/**
 * The tinted-glass thumb behind the active nav item. It is rendered only inside
 * the active item but shares one `layoutId`, so moving between pages morphs the
 * same pane from row to row instead of fading one out and another in.
 */
const GlassNavThumb = () => (
  <motion.span
    aria-hidden
    layoutId="dashboard-nav-thumb"
    className="glass-nav-thumb glass-tint"
    transition={{ type: "spring", stiffness: 520, damping: 42, mass: 0.9 }}
  />
)

export const DashboardSidebar = () => {
  const pathname = usePathname()
  const { isMobile, setOpenMobile } = useSidebar()
  const { isLoaded: isAuthLoaded, orgId } = useAuth()
  const hasActiveOrganization = isAuthLoaded && Boolean(orgId)
  const conversationUnreadSummary = useQuery(
    api.private.conversations.getUnreadSummary,
    hasActiveOrganization ? {} : "skip"
  )
  const aiVoicechatUnreadSummary = useQuery(
    api.private.aiConversations.getUnreadSummary,
    hasActiveOrganization ? {} : "skip"
  )
  const onboardingStatus = useQuery(
    api.private.onboarding.getStatus,
    hasActiveOrganization ? {} : "skip"
  )
  const markAllConversationsAsRead = useMutation(
    api.private.conversations.markAllAsRead
  )
  const markAllAiVoicechatsAsRead = useMutation(
    api.private.aiConversations.markAllAsRead
  )
  const conversationUnreadCount =
    conversationUnreadSummary?.unreadConversationCount ?? 0
  const aiVoicechatUnreadCount =
    aiVoicechatUnreadSummary?.unreadConversationCount ?? 0

  const isActive = (url: string) => {
    if (url === "/") {
      return pathname === "/"
    }
    return pathname.startsWith(url)
  }

  const getUnreadCount = (url: string) => {
    if (isActive(url)) {
      return 0
    }

    if (url === "/conversations") {
      return conversationUnreadCount
    }

    if (url === "/ai-conversations") {
      return aiVoicechatUnreadCount
    }

    return 0
  }

  const clearUnreadForUrl = useCallback(
    (url: string) => {
      if (!hasActiveOrganization) {
        return
      }

      if (url === "/conversations" && conversationUnreadCount > 0) {
        void markAllConversationsAsRead({})
        return
      }

      if (url === "/ai-conversations" && aiVoicechatUnreadCount > 0) {
        void markAllAiVoicechatsAsRead({})
      }
    },
    [
      aiVoicechatUnreadCount,
      conversationUnreadCount,
      hasActiveOrganization,
      markAllAiVoicechatsAsRead,
      markAllConversationsAsRead,
    ]
  )

  useEffect(() => {
    if (isMobile) {
      setOpenMobile(false)
    }
  }, [isMobile, pathname, setOpenMobile])

  useEffect(() => {
    if (pathname.startsWith("/conversations")) {
      clearUnreadForUrl("/conversations")
      return
    }

    if (pathname.startsWith("/ai-conversations")) {
      clearUnreadForUrl("/ai-conversations")
    }
  }, [clearUnreadForUrl, pathname])

  const renderNavItem = (
    item: { title: string; url: string; icon: LucideIcon },
    badge?: React.ReactNode
  ) => {
    const active = isActive(item.url)

    return (
      <SidebarMenuItem className="relative" key={item.url}>
        <SidebarMenuButton asChild tooltip={item.title} isActive={active}>
          <Link href={item.url} onClick={() => clearUnreadForUrl(item.url)}>
            {active ? <GlassNavThumb /> : null}
            <item.icon className="size-4" />
            <span>{item.title}</span>
          </Link>
        </SidebarMenuButton>
        {badge}
      </SidebarMenuItem>
    )
  }

  const unreadBadge = (url: string) => {
    const count = getUnreadCount(url)
    if (count <= 0) {
      return null
    }

    return (
      <SidebarMenuBadge className="bg-rose-500 text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.35),0_6px_14px_-6px_rgb(244_63_94/0.8)]">
        {count > 99 ? "99+" : count}
      </SidebarMenuBadge>
    )
  }

  return (
    <Sidebar collapsible="icon" variant="floating">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              size="lg"
              className="glass glass-interactive group-data-[collapsible=icon]:border-0 group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:bg-none group-data-[collapsible=icon]:shadow-none"
            >
              <OrganizationSwitcher
                hidePersonal
                skipInvitationScreen
                createOrganizationMode="navigation"
                createOrganizationUrl="/create-organization"
                afterCreateOrganizationUrl="/organization-created"
                organizationProfileMode="navigation"
                organizationProfileUrl="/organization-settings"
                appearance={organizationSwitcherAppearance}
              />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="gap-0">
        {/* Getting started — stays in place after setup, because the map of
            what each page is for is useful long after the checklist is done. */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {renderNavItem(
                { title: "Getting started", url: "/start", icon: CompassIcon },
                onboardingStatus && !onboardingStatus.isSetupComplete ? (
                  <SidebarMenuBadge className="bg-primary/15 text-primary peer-data-active/menu-button:bg-white/25 peer-data-active/menu-button:text-sidebar-primary-foreground">
                    {onboardingStatus.completedCount}/
                    {onboardingStatus.totalCount}
                  </SidebarMenuBadge>
                ) : null
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Every day</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {customerSupportItems.map((item) =>
                renderNavItem(item, unreadBadge(item.url))
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Set up once</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {configurationItems.map((item) => renderNavItem(item))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {accountsItem.map((item) => renderNavItem(item))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu className="glass rounded-[1.25rem] p-1 group-data-[collapsible=icon]:rounded-none group-data-[collapsible=icon]:border-0 group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:bg-none group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:shadow-none group-data-[collapsible=icon]:[backdrop-filter:none] group-data-[collapsible=icon]:[-webkit-backdrop-filter:none]">
          <SidebarMenuItem>
            <LanguageSwitcher compact surface="sidebar" />
          </SidebarMenuItem>
          <SidebarMenuItem>
            <DashboardThemeToggle sidebar />
          </SidebarMenuItem>
          <SidebarMenuItem>
            <UserButton
              showName
              userProfileMode="navigation"
              userProfileUrl="/account"
              appearance={userButtonAppearance}
            />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
