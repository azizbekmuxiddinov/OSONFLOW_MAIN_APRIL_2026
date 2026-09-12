import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';
import type { McpNodeData } from '../lib/types';
import EditableNodeTitle from './EditableNodeTitle';
import NodePorts from './NodePorts';

/**
 * An MCP step calls one tool exposed by a connected MCP server. Like the other
 * Tools steps it only names the tool; the server connection is configured once
 * in the Tools tab and shared by every workflow that reaches for it.
 */
const McpNode = ({ id, data }: NodeProps<McpNodeData>) => {
  return (
    <div className={`node node-generic node-dev node-color-${data.blockColor ?? 'default'}`}>
      <EditableNodeTitle nodeId={id} value={data.customName} fallback="MCP" />
      <div className="node-body">
        {data.toolName ? (
          <div className="node-chip">{data.toolName}</div>
        ) : (
          <div className="node-empty">No MCP tool selected</div>
        )}
      </div>
      <NodePorts
        ports={[
          { id: 'success', label: 'ok' },
          { id: 'fail', label: 'error' },
        ]}
      />
      <Handle type="target" position={Position.Left} className="node-handle" />
    </div>
  );
};

export default McpNode;
