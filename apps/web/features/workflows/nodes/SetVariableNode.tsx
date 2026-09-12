import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';
import { normalizeSetEntries, type SetVariableNodeData } from '../lib/types';
import EditableNodeTitle from './EditableNodeTitle';
import NodeText from './NodeText';
import SourceHandle from './SourceHandle';

const SetVariableNode = ({ id, data }: NodeProps<SetVariableNodeData>) => {
  const variables = normalizeSetEntries(data);
  const properties = data.properties ?? [];
  const rows = [...variables, ...properties];

  return (
    <div className={`node node-variable node-color-${data.blockColor ?? 'default'}`}>
      <EditableNodeTitle nodeId={id} value={data.customName} fallback="Set" />
      <div className="node-body">
        {rows.length === 0 ? (
          <div className="node-empty">Set variable</div>
        ) : (
          rows.map((entry) => (
            <div key={entry.id} className="node-kv">
              <span>
                <NodeText text={entry.key || 'variable'} />
              </span>
              <strong>
                <NodeText text={entry.value || 'value'} />
              </strong>
            </div>
          ))
        )}
      </div>
      <Handle type="target" position={Position.Left} className="node-handle" />
      <SourceHandle className="node-handle" />
    </div>
  );
};

export default SetVariableNode;
