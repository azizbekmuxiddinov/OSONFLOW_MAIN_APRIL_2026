export const WORKFLOW_SCHEMA_VERSION = 1 as const;

export type NodeType =
  | 'start'
  | 'block'
  | 'playbook'
  | 'agent'
  | 'crew'
  | 'operator'
  | 'message'
  | 'prompt'
  | 'image'
  | 'card'
  | 'carousel'
  | 'buttons'
  | 'choice'
  | 'capture'
  | 'listen'
  | 'setVariable'
  | 'condition'
  | 'component'
  | 'end'
  | 'tool'
  | 'function'
  | 'api'
  | 'integration'
  | 'mcp'
  | 'javascript'
  | 'kbSearch'
  | 'callForward'
  | 'customAction';

export type ButtonOption = {
  id: string;
  label: string;
};

export type BlockColor = 'default' | 'blue' | 'green' | 'orange' | 'purple' | 'rose';

export type NodeVisual = {
  customName?: string;
  blockColor?: BlockColor;
  /**
   * A hue picked from the slider, as #rrggbb. Kept separate from
   * `blockColor` rather than widening that union: the presets are named,
   * saved workflows already carry them, and only one of the two can be in
   * force — choosing a preset clears this, and moving the slider is what
   * sets it.
   */
  customColor?: string;
};

/**
 * Fallback ports every listening step can opt into. `noMatch` fires when the
 * reply matched no button or path, `noReply` when the user said nothing at
 * all, and `listenOtherTriggers` lets global triggers interrupt the step
 * instead of it swallowing the turn. Each enabled flag adds one source port,
 * which is why they live on the data rather than on the node component.
 */
export type ListenFallbacks = {
  noMatch?: boolean;
  noReply?: boolean;
  listenOtherTriggers?: boolean;
};

/** Port ids the fallback flags contribute, shared by node and runtime. */
export const NO_MATCH_PORT = 'noMatch';
export const NO_REPLY_PORT = 'noReply';
export const ELSE_PORT = 'else';
export const FAILURE_PORT = 'fail';

export type StartNodeData = NodeVisual & {
  label: 'Start';
};

/**
 * A Message is either scripted copy or a one-shot AI generation. The two modes
 * keep their own text so switching tabs never destroys what the other holds.
 */
export type MessageMode = 'scripted' | 'prompt';

export type MessageNodeData = NodeVisual & {
  label: 'Message';
  text: string;
  mode?: MessageMode;
  /** Instructions used when `mode` is 'prompt'. */
  instructions?: string;
  /** Alternates picked at random each time the step runs. */
  variants?: string[];
  /** Turns the step into a listening one: it stops and waits for a reply. */
  waitForUserInput?: boolean;
} & ListenFallbacks;

export type ImageNodeData = NodeVisual & {
  label: 'Image';
  source?: 'upload' | 'link';
  url: string;
  alt: string;
  fileName?: string;
};

export type CardNodeData = NodeVisual & {
  label: 'Card';
  source?: 'upload' | 'link';
  url: string;
  alt: string;
  fileName?: string;
  title: string;
  description: string;
  buttons: ButtonOption[];
} & ListenFallbacks;

export type ButtonsNodeData = NodeVisual & {
  label: 'Buttons';
  buttons: ButtonOption[];
} & ListenFallbacks;

/**
 * Listen pauses the flow and stores whatever the user says next. It is the
 * unconditional counterpart to Buttons: no matching, just capture and move on.
 */
export type ListenNodeData = NodeVisual & {
  label: 'Listen';
  /** Variable the whole reply is written to. */
  variableKey: string;
} & ListenFallbacks;

/** An Integration step runs a provider tool configured in the Tools tab. */
export type IntegrationNodeData = NodeVisual & {
  label: 'Integration';
  provider?: AgentToolKind;
  toolName?: string;
  outputVariable?: string;
};

/** An MCP step calls a tool exposed by a connected MCP server. */
export type McpNodeData = NodeVisual & {
  label: 'MCP';
  toolName?: string;
  outputVariable?: string;
};

export type ChoiceNodeData = NodeVisual & {
  label: 'Choice';
  choices: ButtonOption[];
  variableKey: string;
  prompt?: string;
};

export type CaptureNodeData = NodeVisual & {
  label: 'Capture';
  variableKey: string;
  prompt?: string;
};

/** One `name = value` assignment inside a Set step. */
export type SetEntry = {
  id: string;
  key: string;
  value: string;
};

export type SetVariableNodeData = NodeVisual & {
  label: 'Set Variable';
  /**
   * Multi-assignment form. Absent on workflows saved before Set could write
   * more than one variable, which still carry the `key`/`value` pair below.
   */
  variables?: SetEntry[];
  /** Writes onto the conversation profile rather than run-scoped variables. */
  properties?: SetEntry[];
  key: string;
  value: string;
};

export type ConditionOperator =
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'not_contains'
  | 'greater_than'
  | 'less_than'
  | 'exists'
  | 'not_exists';

/** One clause of a condition path. Clauses inside a path are ANDed. */
export type ConditionClause = {
  id: string;
  key: string;
  operator: ConditionOperator;
  value: string;
};

/**
 * A named branch of a Condition. Each path becomes one source port, so the
 * canvas shows exactly as many outgoing wires as there are paths (plus Else).
 */
export type ConditionPath = {
  id: string;
  name: string;
  clauses: ConditionClause[];
};

export type ConditionNodeData = NodeVisual & {
  label: 'Condition';
  /**
   * Multi-path form. When absent the node falls back to the legacy
   * single-clause `key`/`operator`/`value` triple below, which older saved
   * workflows still carry and which `normalizeConditionPaths` upgrades.
   */
  paths?: ConditionPath[];
  /** Adds a catch-all port taken when no path matched. */
  elsePath?: boolean;
  key: string;
  operator: ConditionOperator;
  value: string;
};

export type PromptNodeData = NodeVisual & {
  label: 'Prompt';
  instructions: string;
  useKnowledgeBase?: boolean;
  outputVariable?: string;
};

export type KbSearchNodeData = NodeVisual & {
  label: 'KB search';
  query: string;
  outputVariable?: string;
  sendAsMessage?: boolean;
};

/**
 * Which integration an agent tool points at. Only some of these have a backend
 * today; `agent-config.ts` carries that availability so the editor can never
 * offer a tool the runtime cannot actually call.
 */
export type AgentToolKind =
  | 'api'
  | 'function'
  | 'mcp'
  | 'googleSheets'
  | 'googleCalendar'
  | 'zendesk'
  | 'salesforce'
  | 'shopify'
  | 'gmail'
  | 'airtable'
  | 'make'
  | 'twilio'
  | 'hubspot';

export type AgentTool = {
  id: string;
  kind: AgentToolKind;
  /** Name of the configured assistant tool this runs, when it needs one. */
  toolName?: string;
};

/** Reply formats and terminal moves an agent turn is allowed to produce. */
export type AgentCapability =
  | 'knowledgeBase'
  | 'buttons'
  | 'cards'
  | 'carousels'
  | 'callForward'
  | 'webSearch'
  | 'end';

export type AgentExitVariable = {
  id: string;
  name: string;
  description: string;
};

/**
 * A named way out of an agent turn. Each one becomes an outgoing port on the
 * node, so an agent branches on the canvas exactly like a Condition does.
 */
export type AgentExitCondition = {
  id: string;
  name: string;
  /** Natural language the model matches the conversation against. */
  description: string;
  /** Values the agent must have collected before this exit can be taken. */
  requiredVariables: AgentExitVariable[];
  /** Sent verbatim when the exit is taken, before control leaves the node. */
  messages: string[];
};

/** Configuration shared by every node in the agent family. */
export type AgentConfig = {
  /** Chat model id; falls back to the deployment default when unset. */
  model?: string;
  /** Id of the preset the instructions were seeded from, for the editor. */
  persona?: string;
  tools?: AgentTool[];
  capabilities?: AgentCapability[];
  exitConditions?: AgentExitCondition[];
};

export type PlaybookNodeData = NodeVisual &
  AgentConfig & {
    label: string;
    instructions: string;
    talksFirst?: boolean;
    useKnowledgeBase?: boolean;
    outputVariable?: string;
  };

export type AgentNodeData = PlaybookNodeData;

export const API_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as const;

export type ApiMethod = (typeof API_METHODS)[number];

export type ApiHeader = {
  id: string;
  key: string;
  value: string;
};

export type ApiNodeData = NodeVisual & {
  label: 'API';
  method: ApiMethod;
  url: string;
  headers: ApiHeader[];
  body: string;
  /** Raw response body is stored here; JSON fields are flattened under it. */
  responseVariable: string;
  statusVariable: string;
};

export type CarouselCard = {
  id: string;
  title: string;
  description: string;
  url: string;
  buttons: ButtonOption[];
};

export type CarouselNodeData = NodeVisual & {
  label: 'Carousel';
  cards: CarouselCard[];
} & ListenFallbacks;

export type CustomActionNodeData = NodeVisual & {
  label: 'Custom action';
  /** Name carried in the workflow.action webhook payload. */
  actionName: string;
  /** JSON object template; {{variables}} are interpolated before dispatch. */
  payload: string;
};

export type JavascriptNodeData = NodeVisual & {
  label: 'JavaScript';
  code: string;
  /** Comma-free list of variable names the snippet is expected to produce. */
  outputVariables: string[];
  /**
   * Named exits the snippet picks between by returning `{ next }`, mirroring
   * Function. Absent means the single legacy success/error pair is used.
   */
  paths?: FunctionPath[];
  /** Adds the error port taken when the snippet throws. */
  failurePath?: boolean;
};

/** The End step can send one last message before it closes the conversation. */
export type EndNodeData = NodeVisual & {
  label: 'End';
  message?: string;
  /** Where older and AI-drafted End steps kept their goodbye. */
  description?: string;
};

export type ToolArgument = {
  id: string;
  name: string;
  value: string;
};

export type ToolNodeData = NodeVisual & {
  label: 'Tool';
  /** Matches an assistantTools row by name, the same key the AI agent uses. */
  toolName: string;
  arguments: ToolArgument[];
  outputVariable: string;
};

/**
 * One step inside a Block. Steps run top-to-bottom with no wires between
 * them; only the block itself is wired on the canvas.
 */
export type BlockStep = {
  id: string;
  type: NodeType;
  data: NodeData;
};

export type BlockNodeData = NodeVisual & {
  label: 'Block';
  steps: BlockStep[];
};

export type FunctionPath = {
  id: string;
  name: string;
};

export type FunctionNodeData = NodeVisual & {
  label: 'Function';
  code: string;
  /** Named exits the snippet can pick between by returning { next }. */
  paths: FunctionPath[];
};

export type ComponentInput = {
  id: string;
  name: string;
  value: string;
};

export type ComponentNodeData = NodeVisual & {
  label: 'Component';
  /** Id of the workflow this component runs. */
  workflowId: string;
  /** Cached name so the canvas can label the block without a lookup. */
  workflowName?: string;
  inputs: ComponentInput[];
};

export type CallForwardNodeData = NodeVisual & {
  label: 'Call forward';
  description?: string;
};

export type GenericNodeData = NodeVisual &
  AgentConfig & {
    label: string;
    description?: string;
    /** Copy sent by End before it closes the conversation. */
    message?: string;
    accent?: 'agent' | 'talk' | 'listen' | 'logic' | 'dev' | 'system';
    instructions?: string;
    query?: string;
    variableKey?: string;
    outputVariable?: string;
    useKnowledgeBase?: boolean;
    talksFirst?: boolean;
    sendAsMessage?: boolean;
    choices?: ButtonOption[];
    prompt?: string;
  };

export type NodeData =
  | StartNodeData
  | MessageNodeData
  | ImageNodeData
  | CardNodeData
  | ButtonsNodeData
  | ChoiceNodeData
  | CaptureNodeData
  | ListenNodeData
  | IntegrationNodeData
  | McpNodeData
  | EndNodeData
  | SetVariableNodeData
  | ConditionNodeData
  | ApiNodeData
  | CarouselNodeData
  | CustomActionNodeData
  | JavascriptNodeData
  | ToolNodeData
  | ComponentNodeData
  | BlockNodeData
  | FunctionNodeData
  | PromptNodeData
  | KbSearchNodeData
  | PlaybookNodeData
  | CallForwardNodeData
  | GenericNodeData;

export type WorkflowNode = {
  id: string;
  type: NodeType;
  position: { x: number; y: number };
  data: NodeData;
};

export type WorkflowEdge = {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
  data?: WorkflowEdgeData | null;
};

export type WorkflowEdgeData = {
  label?: string;
  color?: string;
};

export type WorkflowDefinition = {
  schemaVersion: typeof WORKFLOW_SCHEMA_VERSION;
  id?: string;
  name: string;
  description?: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
};

export type RuntimeVariables = Record<string, string>;

export type WaitingMode = 'buttons' | 'capture' | 'choice' | 'ai_turn';

/**
 * Step types that expose more than one outgoing port, or that end the run.
 * These can only ever be the last step of a block: anything placed after them
 * would be unreachable, or would need ports the block cannot show.
 */
export const isTerminalStepType = (type: NodeType) =>
  type === 'buttons' ||
  type === 'choice' ||
  type === 'condition' ||
  type === 'api' ||
  type === 'integration' ||
  type === 'mcp' ||
  type === 'javascript' ||
  type === 'function' ||
  type === 'tool' ||
  type === 'carousel' ||
  type === 'card' ||
  type === 'listen' ||
  type === 'end' ||
  type === 'callForward';

/**
 * Upgrades a Condition saved before it supported multiple paths into the
 * multi-path shape, so the editor and the runtime only ever see `paths`.
 */
export const normalizeConditionPaths = (
  data: ConditionNodeData
): ConditionPath[] => {
  if (data.paths?.length) return data.paths;
  if (!data.key) return [];
  return [
    {
      id: 'true',
      /* Left unnamed on purpose: the canvas then labels the port with the
         clause itself ("tier is pro") rather than a meaningless "Path 1". */
      name: '',
      clauses: [
        {
          id: `${data.key}-legacy`,
          key: data.key,
          operator: data.operator,
          value: data.value,
        },
      ],
    },
  ];
};

/** The same upgrade for a Set saved with a single key/value pair. */
export const normalizeSetEntries = (data: SetVariableNodeData): SetEntry[] => {
  if (data.variables?.length) return data.variables;
  if (!data.key) return [];
  return [{ id: `${data.key}-legacy`, key: data.key, value: data.value }];
};

/**
 * Fallback ports contributed by a listening step's toggles. Appended after a
 * step's own ports so enabling one never renumbers the wires already drawn.
 */
export const fallbackPorts = (
  data: ListenFallbacks
): Array<{ id: string; label: string }> => {
  const ports: Array<{ id: string; label: string }> = [];
  if (data.noMatch) ports.push({ id: NO_MATCH_PORT, label: 'no match' });
  if (data.noReply) ports.push({ id: NO_REPLY_PORT, label: 'no reply' });
  return ports;
};

/** Node types that run an agent turn and can carry exit conditions. */
export const isAgentStepType = (type: NodeType) =>
  type === 'playbook' ||
  type === 'agent' ||
  type === 'crew' ||
  type === 'operator';

/** Named source ports a step contributes to its block, with their labels. */
export const stepPorts = (step: BlockStep): Array<{ id: string; label: string }> => {
  if (isAgentStepType(step.type)) {
    // An agent with no exit conditions just falls through its default handle.
    return ((step.data as AgentNodeData).exitConditions ?? []).map((exit) => ({
      id: exit.id,
      label: exit.name.trim() || 'Exit',
    }));
  }

  switch (step.type) {
    case 'condition': {
      const data = step.data as ConditionNodeData;
      const paths = normalizeConditionPaths(data).map((path, index) => ({
        id: path.id,
        label: path.name.trim() || `Path ${index + 1}`,
      }));
      if (data.elsePath) paths.push({ id: ELSE_PORT, label: 'else' });
      return paths;
    }
    case 'function':
      return ((step.data as FunctionNodeData).paths ?? []).map((path) => ({
        id: path.id,
        label: path.name,
      }));
    case 'javascript': {
      const data = step.data as JavascriptNodeData;
      if (data.paths?.length) {
        const paths = data.paths.map((path) => ({
          id: path.id,
          label: path.name,
        }));
        if (data.failurePath) paths.push({ id: FAILURE_PORT, label: 'error' });
        return paths;
      }
      return [
        { id: 'success', label: 'ok' },
        { id: 'fail', label: 'error' },
      ];
    }
    case 'api':
    case 'integration':
    case 'mcp':
    case 'tool':
      return [
        { id: 'success', label: 'ok' },
        { id: 'fail', label: 'error' },
      ];
    case 'buttons': {
      const data = step.data as ButtonsNodeData;
      return [
        ...(data.buttons ?? []).map((b) => ({ id: b.id, label: b.label })),
        ...fallbackPorts(data),
      ];
    }
    case 'choice':
      return ((step.data as ChoiceNodeData).choices ?? []).map((c) => ({
        id: c.id,
        label: c.label,
      }));
    case 'listen':
      return fallbackPorts(step.data as ListenNodeData);
    case 'card': {
      const data = step.data as CardNodeData;
      return [
        ...(data.buttons ?? []).map((b) => ({ id: b.id, label: b.label })),
        ...fallbackPorts(data),
      ];
    }
    case 'carousel': {
      const data = step.data as CarouselNodeData;
      return [
        ...(data.cards ?? []).flatMap((card) =>
          card.buttons.map((b) => ({ id: b.id, label: b.label }))
        ),
        ...fallbackPorts(data),
      ];
    }
    case 'message': {
      const data = step.data as MessageNodeData;
      return data.waitForUserInput ? fallbackPorts(data) : [];
    }
    default:
      return [];
  }
};
