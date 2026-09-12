import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';
import type { MessageNodeData } from '../lib/types';
import EditableNodeTitle from './EditableNodeTitle';
import SourceHandle from './SourceHandle';

const MessageNode = ({ id, data }: NodeProps<MessageNodeData>) => {
  return (
    <div className={`node node-message node-color-${data.blockColor ?? 'default'}`}>
      <EditableNodeTitle nodeId={id} value={data.customName} fallback="Message" />
      <div className="node-body">
        <div
          className="node-message-clamp"
          dangerouslySetInnerHTML={{ __html: data.text || 'Enter message' }}
        />
      </div>
      <Handle type="target" position={Position.Left} className="node-handle" />
      <SourceHandle className="node-handle" />
    </div>
  );
};

export default MessageNode;
