import Image from "next/image"
import { CheckIcon, Table2Icon } from "lucide-react"
import type { CSSProperties } from "react"

/**
 * The stage beside the sign-in form: the product at work, drawn rather than
 * claimed.
 *
 * A customer writes in Uzbek and the assistant answers in Uzbek. The order
 * lookup appears on a separate "behind the scenes" card, because a tool's
 * result is internal — in the real widget the customer only ever sees the
 * assistant's own sentence. The Uzbek lines are the example itself and are
 * marked `lang="uz"`, so they read the same whichever interface language is
 * chosen.
 */

const delay = (seconds: number) => ({ "--d": `${seconds}s` }) as CSSProperties

export const AuthBrandPanel = () => {
  return (
    <aside
      aria-label="What your assistant does"
      className="auth-stage-wrap hidden lg:block"
    >
      <div className="auth-stage">
        <Image
          alt=""
          className="auth-stage__photo"
          fill
          priority
          sizes="55vw"
          src="/landing/assets/hero-landscape.png"
        />
        <div aria-hidden className="auth-stage__veil" />

        <div className="auth-stage__content">
          <p className="auth-glass-pill">
            <span aria-hidden className="auth-live-dot" />
            <span className="truncate">
              Your website, Telegram, WhatsApp and Instagram
            </span>
          </p>

          <div aria-hidden className="auth-scene">
            <div className="auth-scene__stack">
              <div className="auth-behind">
                <p className="auth-behind__label">Behind the scenes</p>
                <div className="auth-behind__row">
                  <span className="auth-behind__icon">
                    <span className="auth-swap">
                      <span className="auth-swap__before flex items-center justify-center">
                        <span className="auth-spinner" />
                      </span>
                      <span className="auth-swap__after flex items-center justify-center">
                        <Table2Icon className="size-4" />
                      </span>
                    </span>
                  </span>
                  <span className="auth-swap min-w-0">
                    <span className="auth-swap__before">
                      <span className="auth-behind__title block">
                        Looking up the order…
                      </span>
                      <span className="auth-behind__meta block">
                        Google Sheets
                      </span>
                    </span>
                    <span className="auth-swap__after">
                      <span className="auth-behind__title flex items-center gap-1.5">
                        <CheckIcon className="size-3.5 shrink-0 text-[#5fdc9c]" />
                        Order found
                      </span>
                      <span className="auth-behind__meta block">
                        Shipped today, arrives tomorrow
                      </span>
                    </span>
                  </span>
                </div>
              </div>

              <div className="auth-chat-wrap">
                <span className="auth-lang-pill">
                  O‘zbekcha · Русский · English
                </span>

                <div className="auth-chat">
                  <div className="auth-chat__head">
                    <span className="auth-chat__avatar">
                      <Image
                        alt=""
                        height={40}
                        src="/landing/assets/logo-mark.svg"
                        width={70}
                      />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[0.86rem] leading-tight font-semibold">
                        Your assistant
                      </p>
                      <p className="mt-0.5 flex items-center gap-1.5 text-[0.72rem] text-[var(--auth-ink-soft)]">
                        <span className="size-1.5 rounded-full bg-[#22c55e]" />
                        Online
                      </p>
                    </div>
                  </div>

                  <div className="auth-chat__body">
                    <p
                      className="auth-msg auth-msg--customer"
                      lang="uz"
                      style={delay(0.9)}
                    >
                      Salom! 4821-buyurtmam qachon yetib keladi?
                    </p>
                    <p
                      className="auth-msg auth-msg--assistant"
                      lang="uz"
                      style={delay(3.3)}
                    >
                      Buyurtmangiz bugun jo‘natildi va ertaga soat 14:00 gacha
                      yetib boradi. Kuryer raqamini yuboraymi?
                    </p>
                    <p
                      className="auth-msg auth-msg--customer"
                      lang="uz"
                      style={delay(5)}
                    >
                      Ha, iltimos!
                    </p>
                    <span className="auth-typing" style={delay(5.8)}>
                      <span />
                      <span />
                      <span />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="auth-stage__headline">
              Every customer answered, in their own language.
            </h2>
            <p className="auth-stage__lede">
              Your assistant replies day and night, checks the tools you already
              use, and brings in your team when a person is needed.
            </p>
          </div>
        </div>
      </div>
    </aside>
  )
}
