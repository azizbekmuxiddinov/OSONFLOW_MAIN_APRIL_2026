import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';
import type { ChoiceNodeData } from '../lib/types';
import { htmlToTemplateText } from '../lib/variable-tokens';
import EditableNodeTitle from './EditableNodeTitle';
import NodeText from './NodeText';
import SourceHandle from './SourceHandle';

const ChoiceNode = ({ id, data }: NodeProps<ChoiceNodeData>) => {
  const choices = data.choices ?? [];
  // The prompt is written in the rich editor, so the canvas shows its text
  // rather than its markup.
  const prompt = htmlToTemplateText(data.prompt ?? '');

  return (
    <div className={`node node-buttons node-color-${data.blockColor ?? 'default'}`}>
      <EditableNodeTitle nodeId={id} value={data.customName} fallback="Choice" />
      <div className="node-body">
        {prompt ? (
          <div className="node-empty" style={{ marginBottom: 8 }}>
            <NodeText text={prompt} />
          </div>
        ) : null}
        {choices.length === 0 ? (
          <div className="node-empty">Add choices in the inspector.</div>
        ) : (
          choices.map((choice) => (
            <div key={choice.id} className="node-button">
              <NodeText text={choice.label} />
              <SourceHandle
                id={choice.id}
                className="node-handle node-button-handle"
              />
            </div>
          ))
        )}
        <div className="node-chip" style={{ marginTop: 8 }}>
          → {data.variableKey || 'lastInput'}
        </div>
      </div>
      <Handle type="target" position={Position.Left} className="node-handle" />
    </div>
  );
};

export default ChoiceNode;
