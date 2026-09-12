import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';
import type { GenericNodeData } from '../lib/types';
import EditableNodeTitle from './EditableNodeTitle';
import NodeText from './NodeText';
import SourceHandle from './SourceHandle';

const GenericStepNode = ({ id, data }: NodeProps<GenericNodeData>) => {
  const preview =
    data.instructions?.trim() ||
    data.query?.trim() ||
    data.description?.trim() ||
    'Configure this step in the inspector.';

  return (
    <div
      className={`node node-generic node-${data.accent ?? 'system'} node-color-${
        data.blockColor ?? 'default'
      }`}
    >
      <EditableNodeTitle nodeId={id} value={data.customName} fallback={data.label} />
      <div className="node-body">
        <NodeText text={preview} />
      </div>
      <Handle type="target" position={Position.Left} className="node-handle" />
      <SourceHandle className="node-handle" />
    </div>
  );
};

export default GenericStepNode;
