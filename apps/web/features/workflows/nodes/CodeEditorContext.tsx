import { createContext, useContext } from 'react';

/** Opens the full-window code editor for a node. */
export type OpenCodeEditor = (nodeId: string) => void;

/**
 * Canvas nodes are rendered by React Flow, far from the builder's own state,
 * so the expand button reaches the editor through context rather than through
 * a prop threaded down every node type.
 */
export const CodeEditorContext = createContext<OpenCodeEditor | null>(null);

export const useOpenCodeEditor = () => useContext(CodeEditorContext);
