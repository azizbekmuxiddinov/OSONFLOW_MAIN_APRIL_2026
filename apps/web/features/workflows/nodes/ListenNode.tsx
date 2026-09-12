import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';
import { fallbackPorts, type ListenNodeData } from '../lib/types';
import EditableNodeTitle from './EditableNodeTitle';
import NodePorts from './NodePorts';
import SourceHandle from './SourceHandle';

/**
 * Listen stops the flow and keeps the whole reply. Unlike Buttons it matches
 * nothing, so its only exits are the fallback ports its toggles add; when none
 * are on it falls through the single default handle on the right.
 */
const ListenNode = ({ id, data }: NodeProps<ListenNodeData>) => {
  const ports = fallbackPorts(data);

  return (
    <div className={`node node-generic node-listen node-color-${data.blockColor ?? 'default'}`}>
      <EditableNodeTitle nodeId={id} value={data.customName} fallback="Listen" />
      <div className="node-body">
        <div className="node-empty">Listen and save reply to:</div>
        <div className="node-chip" style={{ marginTop: 6 }}>
          {data.variableKey || 'last_utterance'}
        </div>
      </div>
      <NodePorts ports={ports} />
      <Handle type="target" position={Position.Left} className="node-handle" />
      {ports.length === 0 ? (
        <SourceHandle className="node-handle" />
      ) : null}
    </div>
  );
};

export default ListenNode;
