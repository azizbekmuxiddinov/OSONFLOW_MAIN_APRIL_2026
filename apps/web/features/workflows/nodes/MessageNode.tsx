import { useMemo } from 'react';
import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';
import { sanitizeWorkflowMessageHtml } from '@workspace/ui/lib/rich-text';
import type { MessageNodeData } from '../lib/types';
import EditableNodeTitle from './EditableNodeTitle';
import SourceHandle from './SourceHandle';

const MessageNode = ({ id, data }: NodeProps<MessageNodeData>) => {
  // data.text is author-controlled innerHTML from the message editor, so it is
  // sanitized before it is painted into another builder user's page.
  const safeHtml = useMemo(
    () => (data.text ? sanitizeWorkflowMessageHtml(data.text) : ''),
    [data.text]
  );

  return (
    <div className={`node node-message node-color-${data.blockColor ?? 'default'}`}>
      <EditableNodeTitle nodeId={id} value={data.customName} fallback="Message" />
      <div className="node-body">
        <div
          className="node-message-clamp"
          dangerouslySetInnerHTML={{ __html: safeHtml || 'Enter message' }}
        />
      </div>
      <Handle type="target" position={Position.Left} className="node-handle" />
      <SourceHandle className="node-handle" />
    </div>
  );
};

export default MessageNode;
