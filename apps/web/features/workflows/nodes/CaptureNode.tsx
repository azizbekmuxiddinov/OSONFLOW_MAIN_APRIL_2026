import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';
import type { CaptureNodeData } from '../lib/types';
import { htmlToTemplateText } from '../lib/variable-tokens';
import EditableNodeTitle from './EditableNodeTitle';
import NodeText from './NodeText';
import SourceHandle from './SourceHandle';

const CaptureNode = ({ id, data }: NodeProps<CaptureNodeData>) => {
  // The prompt is written in the rich editor, so the canvas shows its text
  // rather than its markup.
  const prompt = htmlToTemplateText(data.prompt ?? '');

  return (
    <div className={`node node-generic node-listen node-color-${data.blockColor ?? 'default'}`}>
      <EditableNodeTitle nodeId={id} value={data.customName} fallback="Capture" />
      <div className="node-body">
        <div className="node-chip">{data.variableKey || 'lastInput'}</div>
        {prompt ? (
          <div className="node-empty" style={{ marginTop: 8 }}>
            <NodeText text={prompt} />
          </div>
        ) : (
          <div className="node-empty" style={{ marginTop: 8 }}>
            Waits for the user reply, then stores it.
          </div>
        )}
      </div>
      <Handle type="target" position={Position.Left} className="node-handle" />
      <SourceHandle className="node-handle" />
    </div>
  );
};

export default CaptureNode;
