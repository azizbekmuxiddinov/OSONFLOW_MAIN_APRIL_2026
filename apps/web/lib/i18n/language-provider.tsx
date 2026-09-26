"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"

import {
  LANGUAGE_LABELS,
  type Language,
  SUPPORTED_LANGUAGES,
  normalizeTranslatableText,
  translateText,
} from "./translations"

const LANGUAGE_STORAGE_KEY = "osonflow-language"
const I18N_ORIGINAL_HTML_ATTR = "data-i18n-original-html"
const HEADLINE_SELECTORS = [
  ".hero__title",
  ".lede__title",
  ".proof__title",
  ".site-end__title",
].join(", ")

type LanguageContextValue = {
  language: Language
  setLanguage: (language: Language) => void
  t: (value: string) => string
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

// What the translator last wrote into a node or attribute, next to the English
// it came from. A value that no longer matches `written` was put there by the
// app (React re-rendering, a script updating a label), so it is the new source
// text — never overwrite it with the stale original.
type TranslatedValue = { original: string; written: string }

const textNodeState = new WeakMap<Text, TranslatedValue>()
const attributeState = new WeakMap<Element, Map<string, TranslatedValue>>()
let translatePassDepth = 0

function sourceTextOf(current: string, state: TranslatedValue | undefined) {
  return state && current === state.written ? state.original : current
}

const ATTRIBUTES_TO_TRANSLATE = [
  "aria-label",
  "alt",
  "placeholder",
  "title",
  "data-placeholder",
]

declare global {
  interface Window {
    __osonflowSplitHeadlines?: (root?: ParentNode | Document | Element) => void
  }
}

const isLanguage = (value: string | null): value is Language =>
  SUPPORTED_LANGUAGES.includes(value as Language)

function getInitialLanguage(): Language {
  if (typeof window === "undefined") {
    return "en"
  }

  const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY)

  if (isLanguage(stored)) {
    return stored
  }

  const browserLanguage = window.navigator.language.toLowerCase()

  if (browserLanguage.startsWith("uz")) {
    return "uz"
  }

  if (browserLanguage.startsWith("ru")) {
    return "ru"
  }

  return "en"
}

// Keeps the English node's surrounding spaces, except where the translation
// is a fragment that must hug its neighbour: one opening with closing
// punctuation (", …", "» …") joins the previous element, and one ending in an
// opening quote or bracket ("… «") joins the next. Word order differs between
// languages, so a sentence split around a <b> needs this to read naturally.
function preserveSpacing(original: string, translated: string) {
  const leading = /^[.,;:!?)»”…]/.test(translated)
    ? ""
    : (original.match(/^\s*/)?.[0] ?? "")
  const trailing = /[(«“]$/.test(translated)
    ? ""
    : (original.match(/\s*$/)?.[0] ?? "")

  return `${leading}${translated}${trailing}`
}

function isInsideMotionWord(node: Node) {
  return (
    node.parentElement?.classList.contains("mo-word") ||
    node.parentElement?.closest(".mo-host") != null
  )
}

/** Code samples and identifiers opt out with the standard `translate="no"`. */
function isTranslationOptedOut(node: Node) {
  return node.parentElement?.closest('[translate="no"]') != null
}

/** The nearest `data-i18n-context`, for words whose meaning depends on where they sit. */
function translationContextOf(element: Element | null) {
  return (
    element?.closest("[data-i18n-context]")?.getAttribute("data-i18n-context") ??
    null
  )
}

function translateTextNode(node: Text, language: Language) {
  // Word-split headlines are handled as whole hosts — skip fragment nodes.
  if (isInsideMotionWord(node) || isTranslationOptedOut(node)) {
    return
  }

  const currentValue = node.nodeValue ?? ""
  const originalValue = sourceTextOf(currentValue, textNodeState.get(node))

  if (!normalizeTranslatableText(originalValue)) {
    return
  }

  const nextValue =
    language === "en"
      ? originalValue
      : preserveSpacing(
          originalValue,
          translateText(
            originalValue,
            language,
            translationContextOf(node.parentElement)
          )
        )

  textNodeState.set(node, { original: originalValue, written: nextValue })

  if (nextValue !== currentValue) {
    node.nodeValue = nextValue
  }
}

function translateElementAttributes(element: Element, language: Language) {
  for (const attribute of ATTRIBUTES_TO_TRANSLATE) {
    const value = element.getAttribute(attribute)

    if (!value) {
      continue
    }

    let states = attributeState.get(element)

    if (!states) {
      states = new Map()
      attributeState.set(element, states)
    }

    const original = sourceTextOf(value, states.get(attribute))
    const translated = translateText(
      original,
      language,
      translationContextOf(element)
    )

    states.set(attribute, { original, written: translated })

    if (value !== translated) {
      element.setAttribute(attribute, translated)
    }
  }
}

/** Translates a detached copy of English markup (a headline snapshot). */
function translateSubtreeText(root: ParentNode, language: Language) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  let current = walker.nextNode()

  while (current) {
    const node = current as Text
    const value = node.nodeValue ?? ""

    if (
      language !== "en" &&
      !isTranslationOptedOut(node) &&
      normalizeTranslatableText(value)
    ) {
      const nextValue = preserveSpacing(value, translateText(value, language))

      if (nextValue !== value) {
        node.nodeValue = nextValue
      }
    }

    current = walker.nextNode()
  }
}

function ensureHeadlineSnapshots(root: ParentNode) {
  root.querySelectorAll?.(HEADLINE_SELECTORS).forEach((node) => {
    if (!(node instanceof HTMLElement)) return
    if (node.getAttribute(I18N_ORIGINAL_HTML_ATTR)) return
    if (node.querySelector(".mo-word")) return
    node.setAttribute(I18N_ORIGINAL_HTML_ATTR, node.innerHTML)
  })
}

function translateMotionHeadline(el: HTMLElement, language: Language) {
  let originalHtml = el.getAttribute(I18N_ORIGINAL_HTML_ATTR)

  if (!originalHtml) {
    // First time seeing a split host without a snapshot — capture English from words.
    const clone = el.cloneNode(true) as HTMLElement
    clone.querySelectorAll(".mo-word").forEach((word) => {
      const parent = word.parentNode
      if (!parent) return
      parent.replaceChild(document.createTextNode(word.textContent ?? ""), word)
    })
    originalHtml = clone.innerHTML
    el.setAttribute(I18N_ORIGINAL_HTML_ATTR, originalHtml)
  }

  const shell = document.createElement("div")
  shell.innerHTML = originalHtml
  translateSubtreeText(shell, language)
  el.innerHTML = shell.innerHTML
  el.classList.remove("mo-host")
  delete el.dataset.moSplit
}

function translateMotionHeadlines(root: ParentNode, language: Language) {
  ensureHeadlineSnapshots(root)

  const hosts = root.querySelectorAll?.(
    `${HEADLINE_SELECTORS}, .mo-host, [data-mo-split], [data-i18n-original-html]`
  )

  if (!hosts?.length) return

  const seen = new Set<HTMLElement>()
  hosts.forEach((node) => {
    if (!(node instanceof HTMLElement) || seen.has(node)) return
    if (!node.matches(HEADLINE_SELECTORS) && !node.hasAttribute(I18N_ORIGINAL_HTML_ATTR)) {
      return
    }
    seen.add(node)
    translateMotionHeadline(node, language)
  })

  // Re-apply word split for animation after language swap.
  window.__osonflowSplitHeadlines?.(root instanceof Element ? root : document)
}

function translateDom(root: Node, language: Language) {
  if (translatePassDepth > 0) {
    // Avoid re-entrancy from MutationObserver while we rewrite headlines.
    if (root.nodeType === Node.TEXT_NODE) {
      translateTextNode(root as Text, language)
    }
    return
  }

  translatePassDepth += 1
  try {
    if (root.nodeType === Node.TEXT_NODE) {
      translateTextNode(root as Text, language)
      return
    }

    if (root instanceof Element) {
      translateElementAttributes(root, language)
    }

    if (root instanceof Element || root instanceof Document) {
      translateMotionHeadlines(root, language)
    }

    const walker = document.createTreeWalker(
      root,
      NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT
    )

    let current = walker.nextNode()

    while (current) {
      if (current.nodeType === Node.TEXT_NODE) {
        translateTextNode(current as Text, language)
      } else if (current.nodeType === Node.ELEMENT_NODE) {
        translateElementAttributes(current as Element, language)
      }

      current = walker.nextNode()
    }
  } finally {
    translatePassDepth -= 1
  }
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en")

  useEffect(() => {
    queueMicrotask(() => setLanguageState(getInitialLanguage()))
  }, [])

  const setLanguage = useCallback((nextLanguage: Language) => {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage)
    setLanguageState(nextLanguage)
  }, [])

  const t = useCallback(
    (value: string) => translateText(value, language),
    [language]
  )

  useEffect(() => {
    document.documentElement.lang = language
    translateDom(document.body, language)

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        mutation.addedNodes.forEach((node) => {
          if (
            node.nodeType === Node.ELEMENT_NODE ||
            node.nodeType === Node.TEXT_NODE
          ) {
            translateDom(node, language)
          }
        })

        if (
          mutation.type === "characterData" &&
          mutation.target.nodeType === Node.TEXT_NODE
        ) {
          translateTextNode(mutation.target as Text, language)
        }

        if (
          mutation.type === "attributes" &&
          mutation.target.nodeType === Node.ELEMENT_NODE
        ) {
          translateElementAttributes(mutation.target as Element, language)
        }
      }
    })

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ATTRIBUTES_TO_TRANSLATE,
      characterData: true,
      childList: true,
      subtree: true,
    })

    // Motion script may split headlines after the first translate pass.
    const retryTimers = [200, 600, 1200].map((ms) =>
      window.setTimeout(() => translateDom(document.body, language), ms)
    )

    return () => {
      observer.disconnect()
      retryTimers.forEach((id) => window.clearTimeout(id))
    }
  }, [language])

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      setLanguage,
      t,
    }),
    [language, setLanguage, t]
  )

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)

  if (!context) {
    throw new Error("useLanguage must be used inside LanguageProvider")
  }

  return context
}

export { LANGUAGE_LABELS, SUPPORTED_LANGUAGES }
