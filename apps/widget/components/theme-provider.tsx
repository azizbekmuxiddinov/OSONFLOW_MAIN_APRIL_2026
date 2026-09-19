'use client'
import * as React from "react";
import { Provider } from "jotai";
import { ConvexProvider, ConvexReactClient } from 'convex/react';
import { createConvexWebSocket } from "@workspace/ui/lib/convex-url";

// One client per page load; creating it during render opened a new socket on
// every re-render.
const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL || "", {
  webSocketConstructor: createConvexWebSocket(),
})

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ConvexProvider client={convex}>
      <Provider>
        {children}
      </Provider>
    </ConvexProvider>

  )
}
