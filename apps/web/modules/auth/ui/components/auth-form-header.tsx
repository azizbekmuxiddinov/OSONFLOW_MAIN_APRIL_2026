import { ArrowLeftIcon, type LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

type AuthFormHeaderProps = {
  title: string
  description: ReactNode
  /** Shown in a medallion above the title on secondary steps. */
  icon?: LucideIcon
  /** A way back to the previous step, above everything else. */
  onBack?: () => void
  backLabel?: string
}

export const AuthFormHeader = ({
  title,
  description,
  icon: Icon,
  onBack,
  backLabel = "Back",
}: AuthFormHeaderProps) => {
  return (
    <header className="auth-form-header">
      {onBack ? (
        <button className="auth-back mb-3" onClick={onBack} type="button">
          <ArrowLeftIcon aria-hidden className="size-4" />
          {backLabel}
        </button>
      ) : null}

      {Icon ? (
        <span aria-hidden className="auth-medallion">
          <Icon className="size-5" strokeWidth={1.75} />
        </span>
      ) : null}

      <h1 className="auth-title">{title}</h1>
      <p className="auth-description">{description}</p>
    </header>
  )
}
