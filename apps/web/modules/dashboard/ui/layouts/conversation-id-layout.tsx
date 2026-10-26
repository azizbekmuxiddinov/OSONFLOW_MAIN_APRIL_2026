"use client"

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@workspace/ui/components/resizable"
import { useIsMobile } from "@workspace/ui/hooks/use-mobile"
import { ContactPanel } from "../components/contact-panel"
import { useConversationContactDocked } from "../hooks/use-conversation-contact-docked"

export const ConversationIdLayout = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const isMobile = useIsMobile()
  const isContactDocked = useConversationContactDocked()

  if (isMobile || !isContactDocked) {
    return (
      <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
        {children}
      </div>
    )
  }

  return (
    <ResizablePanelGroup
      className="h-full min-h-0 flex-1"
      orientation="horizontal"
    >
      <ResizablePanel
        id="conversation-chat"
        minSize={560}
        className="flex min-h-0 min-w-0 flex-col"
      >
        <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          {children}
        </div>
      </ResizablePanel>
      <ResizableHandle
        className="w-px bg-[var(--console-hairline)] transition-colors hover:bg-foreground/25 data-[resize-handle-state=drag]:bg-foreground/35"
      />
      <ResizablePanel
        id="conversation-contact"
        defaultSize={320}
        minSize={280}
        maxSize={380}
        groupResizeBehavior="preserve-pixel-size"
        className="flex min-h-0 min-w-0 flex-col"
      >
        <ContactPanel />
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}
