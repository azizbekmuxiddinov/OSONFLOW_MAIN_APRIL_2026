import { DEVELOPER_API_ENDPOINTS, type DeveloperApiEndpoint } from "./catalog"

type CompiledRoute = {
  endpoint: DeveloperApiEndpoint
  pattern: RegExp
  paramNames: string[]
  /** Literal segments win over parameters: `/knowledge/search` over `/knowledge/:entryId`. */
  paramCount: number
}

const compile = (endpoint: DeveloperApiEndpoint): CompiledRoute => {
  const paramNames: string[] = []
  const source = endpoint.path
    .split("/")
    .map((segment) => {
      if (segment.startsWith(":")) {
        paramNames.push(segment.slice(1))
        return "([^/]+)"
      }

      return segment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    })
    .join("/")

  return {
    endpoint,
    pattern: new RegExp(`^${source}/?$`),
    paramNames,
    paramCount: paramNames.length,
  }
}

const ROUTES = DEVELOPER_API_ENDPOINTS.map(compile).sort(
  (left, right) => left.paramCount - right.paramCount
)

export type RouteMatch =
  | {
      kind: "matched"
      endpoint: DeveloperApiEndpoint
      params: Record<string, string>
    }
  | { kind: "method_not_allowed"; allowed: string[] }
  | { kind: "not_found" }

export const matchRoute = (method: string, pathname: string): RouteMatch => {
  const allowed = new Set<string>()

  for (const route of ROUTES) {
    const match = route.pattern.exec(pathname)

    if (!match) {
      continue
    }

    if (route.endpoint.method !== method) {
      allowed.add(route.endpoint.method)
      continue
    }

    const params: Record<string, string> = {}

    route.paramNames.forEach((name, index) => {
      params[name] = decodeURIComponent(match[index + 1]!)
    })

    return { kind: "matched", endpoint: route.endpoint, params }
  }

  return allowed.size > 0
    ? { kind: "method_not_allowed", allowed: [...allowed] }
    : { kind: "not_found" }
}
