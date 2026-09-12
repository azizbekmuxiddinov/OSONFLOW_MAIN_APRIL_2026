import type { NodeProps } from 'reactflow';
import type { StartNodeData } from '../lib/types';
import EditableNodeTitle from './EditableNodeTitle';
import SourceHandle from './SourceHandle';

/**
 * Start is the one node that keeps a visible caption: it has no body of its
 * own, so without the word the pill would be an empty green lozenge.
 */
const StartNode = ({ id, data }: NodeProps<StartNodeData>) => {
  return (
    <div className={`node node-start node-color-${data.blockColor ?? 'default'}`}>
      <EditableNodeTitle
        nodeId={id}
        value={data.customName}
        fallback={data.label}
        showName={false}
      />
      <span className="node-start-label">
        {data.customName?.trim() || data.label || 'Start'}
      </span>
      <SourceHandle className="node-handle" />
    </div>
  );
};

export default StartNode;
