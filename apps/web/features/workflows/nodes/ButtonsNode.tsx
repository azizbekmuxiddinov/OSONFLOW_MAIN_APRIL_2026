import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';
import { fallbackPorts, type ButtonsNodeData } from '../lib/types';
import EditableNodeTitle from './EditableNodeTitle';
import NodeText from './NodeText';
import NodePorts from './NodePorts';
import SourceHandle from './SourceHandle';

const ButtonsNode = ({ id, data }: NodeProps<ButtonsNodeData>) => {
  return (
    <div className={`node node-buttons node-color-${data.blockColor ?? 'default'}`}>
      <EditableNodeTitle nodeId={id} value={data.customName} fallback="Buttons" />
      <div className="node-body">
        {data.buttons.length === 0 ? (
          <div className="node-empty">Add buttons in the inspector.</div>
        ) : (
          data.buttons.map((button) => (
            <div key={button.id} className="node-button">
              <NodeText text={button.label} />
              <SourceHandle
                id={button.id}
                className="node-handle node-button-handle"
              />
            </div>
          ))
        )}
      </div>
      <NodePorts ports={fallbackPorts(data)} />
      <Handle type="target" position={Position.Left} className="node-handle" />
    </div>
  );
};

export default ButtonsNode;
