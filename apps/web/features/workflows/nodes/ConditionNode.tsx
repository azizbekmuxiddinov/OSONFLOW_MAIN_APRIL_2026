import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';
import {
  ELSE_PORT,
  normalizeConditionPaths,
  type ConditionNodeData,
  type ConditionPath,
} from '../lib/types';
import EditableNodeTitle from './EditableNodeTitle';
import NodePorts from './NodePorts';

const OPERATOR_LABELS: Record<string, string> = {
  equals: 'is',
  not_equals: 'is not',
  contains: 'contains',
  not_contains: 'does not contain',
  greater_than: '>',
  less_than: '<',
  exists: 'exists',
  not_exists: 'does not exist',
};

/**
 * A path reads as its first clause so the canvas shows the actual test rather
 * than a generic "Path 1", the way Voiceflow renders `{var} is Yes`. Extra
 * clauses are summarised rather than listed: the node stays one row per branch.
 */
const pathSummary = (path: ConditionPath, index: number) => {
  const [first] = path.clauses;

  if (path.name.trim()) return path.name.trim();
  if (!first) return `Path ${index + 1}`;

  const operator = OPERATOR_LABELS[first.operator] ?? 'is';
  const needsValue = first.operator !== 'exists' && first.operator !== 'not_exists';
  const head = `${first.key || 'variable'} ${operator}${needsValue ? ` ${first.value || 'value'}` : ''}`;

  return path.clauses.length > 1 ? `${head} +${path.clauses.length - 1}` : head;
};

const ConditionNode = ({ id, data }: NodeProps<ConditionNodeData>) => {
  const paths = normalizeConditionPaths(data);
  const ports = paths.map((path, index) => ({
    id: path.id,
    label: pathSummary(path, index),
  }));

  if (data.elsePath) {
    ports.push({ id: ELSE_PORT, label: 'Else' });
  }

  return (
    <div className={`node node-condition node-color-${data.blockColor ?? 'default'}`}>
      <EditableNodeTitle nodeId={id} value={data.customName} fallback="Condition" />
      <div className="node-body">
        {ports.length === 0 ? (
          <div className="node-empty">Add a conditional path.</div>
        ) : (
          <NodePorts ports={ports} />
        )}
      </div>
      <Handle type="target" position={Position.Left} className="node-handle" />
    </div>
  );
};

export default ConditionNode;
