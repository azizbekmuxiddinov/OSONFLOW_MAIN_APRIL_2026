import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';
import type { IntegrationNodeData } from '../lib/types';
import { INTEGRATION_PROVIDERS } from '../lib/agent-config';
import EditableNodeTitle from './EditableNodeTitle';
import NodePorts from './NodePorts';

/**
 * An Integration step runs one provider tool defined in the Tools tab. It is
 * a picker on the canvas, not a config surface: the credentials and the call
 * itself live with the tool, so the node only names which one it runs.
 */
const IntegrationNode = ({ id, data }: NodeProps<IntegrationNodeData>) => {
  const provider = INTEGRATION_PROVIDERS.find((entry) => entry.kind === data.provider);

  return (
    <div className={`node node-generic node-dev node-color-${data.blockColor ?? 'default'}`}>
      <EditableNodeTitle nodeId={id} value={data.customName} fallback="Integration" />
      <div className="node-body">
        {data.toolName ? (
          <>
            <div className="node-chip">{data.toolName}</div>
            {provider ? (
              <div className="node-empty" style={{ marginTop: 6 }}>
                {provider.label}
              </div>
            ) : null}
          </>
        ) : (
          <div className="node-empty">No integration tool selected</div>
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

export default IntegrationNode;
