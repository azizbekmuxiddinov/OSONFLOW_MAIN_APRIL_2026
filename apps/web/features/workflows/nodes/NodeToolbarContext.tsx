import { createContext, useContext } from 'react';

/**
 * Lets the hover toolbar open the canvas's node menu without every node
 * component having to thread the builder's state down to it.
 */
type OpenNodeMenu = (
  nodeId: string,
  position: { x: number; y: number }
) => void;

export const NodeToolbarContext = createContext<OpenNodeMenu | null>(null);

export const useNodeToolbarActions = () => useContext(NodeToolbarContext);
