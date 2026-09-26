import type { NodeType } from '../lib/types';
import type { IconName } from './StepIcon';

/**
 * Icon for a step type. Shared by the node header on the canvas and by the
 * compact rows inside Block nodes so a step looks the same either way.
 */
export const STEP_ICONS: Partial<Record<NodeType, IconName>> = {
  message: 'message',
  prompt: 'prompt',
  image: 'image',
  card: 'card',
  carousel: 'carousel',
  buttons: 'buttons',
  choice: 'choice',
  capture: 'capture',
  listen: 'listen',
  integration: 'integration',
  mcp: 'mcp',
  condition: 'condition',
  setVariable: 'set',
  component: 'component',
  end: 'end',
  tool: 'tool',
  function: 'function',
  api: 'api',
  javascript: 'javascript',
  kbSearch: 'kb',
  callForward: 'call',
  customAction: 'custom',
  playbook: 'workflow',
  agent: 'agent',
  crew: 'crew',
  operator: 'operator',
  block: 'component',
};

/**
 * What a step is called, everywhere it is named: the step library, the rows
 * inside a block, the inspector title, publish checks and the run log.
 *
 * These used to live in four separate maps that had drifted apart — the
 * library said "Code" and "Workflow" while the canvas said "JavaScript" and
 * "Component" for the very same step.
 */
export const STEP_LABELS: Record<NodeType, string> = {
  start: 'Start',
  block: 'Block',
  message: 'Message',
  prompt: 'Prompt',
  image: 'Image',
  card: 'Card',
  carousel: 'Carousel',
  buttons: 'Buttons',
  choice: 'Choice',
  capture: 'Capture',
  listen: 'Listen',
  integration: 'Integration',
  mcp: 'MCP',
  condition: 'Condition',
  setVariable: 'Set',
  component: 'Workflow',
  end: 'End',
  tool: 'Tool',
  function: 'Function',
  api: 'API',
  javascript: 'Code',
  kbSearch: 'KB search',
  callForward: 'Handoff',
  customAction: 'Custom action',
  playbook: 'Playbook',
  agent: 'Agent',
  crew: 'Crew',
  operator: 'Operator',
};

/** The library name for a step type, tolerating types saved by older builds. */
export const stepLabel = (type: string | null | undefined): string =>
  (type && STEP_LABELS[type as NodeType]) || type || 'Step';

/**
 * Which of the five canvas accents a step belongs to. Drives the tint of the
 * icon chip in the node header, so type is readable at a glance while zoomed
 * out far enough that the label is not.
 */
export const STEP_ACCENTS: Partial<Record<NodeType, string>> = {
  playbook: 'agent',
  agent: 'agent',
  crew: 'agent',
  operator: 'agent',
  message: 'talk',
  prompt: 'talk',
  image: 'talk',
  card: 'talk',
  carousel: 'talk',
  buttons: 'listen',
  choice: 'listen',
  capture: 'listen',
  listen: 'listen',
  condition: 'logic',
  setVariable: 'logic',
  component: 'logic',
  block: 'logic',
  end: 'logic',
  callForward: 'logic',
  tool: 'dev',
  function: 'dev',
  api: 'dev',
  integration: 'dev',
  mcp: 'dev',
  javascript: 'dev',
  kbSearch: 'dev',
  customAction: 'dev',
};
