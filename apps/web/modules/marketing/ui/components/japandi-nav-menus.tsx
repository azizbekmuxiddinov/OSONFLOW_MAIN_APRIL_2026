import {
  ArrowRightIcon,
  BookOpenIcon,
  BracesIcon,
  ChartColumnIcon,
  CircleHelpIcon,
  InboxIcon,
  MessagesSquareIcon,
  PlayIcon,
  PlugIcon,
  RocketIcon,
  RouteIcon,
  ScaleIcon,
  ShieldCheckIcon,
  SparklesIcon,
  WebhookIcon,
  WorkflowIcon,
  WrenchIcon,
  type LucideIcon,
} from "lucide-react"
import Link from "next/link"

// The two drop-down panels of the landing navigation. Each panel is three
// columns, the way larger product sites lay out a mega menu: a featured card
// on the left, then two lists. Section links ("#builder") point at the landing
// page and are resolved per page by the caller — see `resolveHref`.

export type NavMenuId = "platform" | "resources"

type MenuLink = {
  href: string
  label: string
  description?: string
  icon: LucideIcon
}

type Featured = {
  eyebrow: string
  href: string
  image: string
  badge: string
  title: string
  cta: string
}

type ReadItem = {
  href: string
  title: string
  description: string
  image: string
  badge: string
}

type NavMenu = {
  featured: Featured
  columns: [
    { title: string; kind: "list"; links: MenuLink[] } | ReadColumn,
    { title: string; kind: "list" | "links"; links: MenuLink[] },
  ]
}

type ReadColumn = { title: string; kind: "read"; items: ReadItem[] }

export const NAV_MENUS: Record<NavMenuId, NavMenu> = {
  platform: {
    featured: {
      eyebrow: "Featured",
      href: "#builder",
      image: "/landing/assets/menu/platform.webp",
      badge: "Workflow builder",
      title: "Draw a refund or a booking once. It runs the same way every time.",
      cta: "See the builder",
    },
    columns: [
      {
        title: "Build",
        kind: "list",
        links: [
          {
            href: "#feature-ai",
            label: "AI assistant",
            description: "Answers from your own content, with a source.",
            icon: SparklesIcon,
          },
          {
            href: "#builder",
            label: "Workflows",
            description: "Scripted steps for the questions that matter.",
            icon: WorkflowIcon,
          },
          {
            href: "/docs#assistant-tools",
            label: "Assistant tools",
            description: "Look things up, fill a sheet, book a call.",
            icon: WrenchIcon,
          },
          {
            href: "/docs#knowledge-base",
            label: "Knowledge base",
            description: "Files, web pages and your help centre.",
            icon: BookOpenIcon,
          },
        ],
      },
      {
        title: "Run",
        kind: "list",
        links: [
          {
            href: "#feature-inbox",
            label: "Shared inbox",
            description: "Read along and step in at any point.",
            icon: InboxIcon,
          },
          {
            href: "#feature-routing",
            label: "Routing",
            description: "Send the hard ones to the right person.",
            icon: RouteIcon,
          },
          {
            href: "#channels",
            label: "Channels",
            description: "Website, Telegram, Instagram, WhatsApp.",
            icon: MessagesSquareIcon,
          },
          {
            href: "#analytics",
            label: "Analytics",
            description: "What AI solved and what it missed.",
            icon: ChartColumnIcon,
          },
        ],
      },
    ],
  },
  resources: {
    featured: {
      eyebrow: "Featured",
      href: "/docs/api",
      image: "/landing/assets/menu/api.webp",
      badge: "REST · JSON · Webhooks",
      title: "Build on Osonflow with the API, from your app to your CRM",
      cta: "Read the reference",
    },
    columns: [
      {
        title: "Read",
        kind: "read",
        items: [
          {
            href: "/docs",
            title: "Docs",
            description:
              "Set up the assistant, go live on every channel and run the inbox.",
            image: "/landing/assets/menu/docs-thumb.webp",
            badge: "Guide",
          },
          {
            href: "/docs/api",
            title: "API reference",
            description:
              "Every endpoint, permission and limit, with cURL, JavaScript and Python.",
            image: "/landing/assets/menu/api-thumb.webp",
            badge: "/v1",
          },
        ],
      },
      {
        title: "Links",
        kind: "links",
        links: [
          { href: "/docs#quickstart", label: "Quickstart", icon: RocketIcon },
          { href: "/docs/api#webhooks", label: "Webhooks", icon: WebhookIcon },
          { href: "#integrations", label: "Integrations", icon: PlugIcon },
          { href: "#experience", label: "Live demo", icon: PlayIcon },
          { href: "#faq", label: "FAQ", icon: CircleHelpIcon },
          { href: "/docs/api#errors", label: "Errors", icon: BracesIcon },
          { href: "/privacy", label: "Privacy", icon: ShieldCheckIcon },
          { href: "/terms", label: "Terms", icon: ScaleIcon },
        ],
      },
    ],
  },
}

/** Every link a menu holds, flattened — used by the mobile sheet. */
export const menuLinks = (id: NavMenuId) => {
  const menu = NAV_MENUS[id]
  const links: { href: string; label: string }[] = []

  for (const column of menu.columns) {
    if (column.kind === "read") {
      links.push(
        ...column.items.map((item) => ({ href: item.href, label: item.title }))
      )
    } else {
      links.push(...column.links)
    }
  }

  return links
}

const FeaturedCard = ({
  featured,
  resolve,
  onNavigate,
}: {
  featured: Featured
  resolve: (href: string) => string
  onNavigate: () => void
}) => (
  <Link
    className="nav-mega__featured"
    href={resolve(featured.href)}
    onClick={onNavigate}
  >
    <span className="nav-mega__featured-media">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img alt="" decoding="async" loading="lazy" src={featured.image} />
      <span className="nav-mega__badge">{featured.badge}</span>
    </span>
    <span className="nav-mega__featured-title">{featured.title}</span>
    <span className="nav-mega__cta">
      {featured.cta}
      <ArrowRightIcon aria-hidden="true" />
    </span>
  </Link>
)

export const NavMegaPanel = ({
  id,
  resolve,
  onNavigate,
}: {
  id: NavMenuId
  resolve: (href: string) => string
  onNavigate: () => void
}) => {
  const menu = NAV_MENUS[id]

  return (
    <div className="nav-mega__grid" data-menu={id}>
      <div className="nav-mega__col nav-mega__col--featured">
        <p className="nav-mega__heading">{menu.featured.eyebrow}</p>
        <FeaturedCard
          featured={menu.featured}
          onNavigate={onNavigate}
          resolve={resolve}
        />
      </div>

      {menu.columns.map((column) => (
        <div className="nav-mega__col" key={column.title}>
          {/* "Build", "Run" and "Read" are nouns here but verbs elsewhere on
              the site, so the translator looks them up as nav headings. */}
          <p className="nav-mega__heading" data-i18n-context="nav">
            {column.title}
          </p>

          {column.kind === "read" ? (
            <ul className="nav-mega__read">
              {column.items.map((item) => (
                <li key={item.href}>
                  <Link
                    className="nav-mega__read-item"
                    href={resolve(item.href)}
                    onClick={onNavigate}
                  >
                    <span className="nav-mega__thumb">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        alt=""
                        decoding="async"
                        loading="lazy"
                        src={item.image}
                      />
                      <span className="nav-mega__thumb-badge">
                        {item.badge}
                      </span>
                    </span>
                    <span className="nav-mega__read-body">
                      <span className="nav-mega__read-title">{item.title}</span>
                      <span className="nav-mega__read-desc">
                        {item.description}
                      </span>
                      <span className="nav-mega__cta">
                        Read now
                        <ArrowRightIcon aria-hidden="true" />
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : column.kind === "links" ? (
            <ul className="nav-mega__links">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link
                    className="nav-mega__quick"
                    href={resolve(link.href)}
                    onClick={onNavigate}
                  >
                    <link.icon aria-hidden="true" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <ul className="nav-mega__list">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link
                    className="nav-mega__item"
                    href={resolve(link.href)}
                    onClick={onNavigate}
                  >
                    <span className="nav-mega__item-icon">
                      <link.icon aria-hidden="true" />
                    </span>
                    <span>
                      <span className="nav-mega__item-title">{link.label}</span>
                      <span className="nav-mega__item-desc">
                        {link.description}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  )
}
