import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';
import { fallbackPorts, type CardNodeData } from '../lib/types';
import { htmlToTemplateText } from '../lib/variable-tokens';
import EditableNodeTitle from './EditableNodeTitle';
import NodeText from './NodeText';
import NodePorts from './NodePorts';
import SourceHandle from './SourceHandle';

const CardNode = ({ id, data }: NodeProps<CardNodeData>) => {
  const title = data.title?.trim() || 'Untitled card';
  const description = htmlToTemplateText(data.description || '');
  const hasImage = Boolean(data.url?.trim());
  const hasButtons = data.buttons.length > 0;

  return (
    <div
      className={`node node-card ${hasImage ? 'node-card-has-image' : ''} node-color-${
        data.blockColor ?? 'default'
      }`}
    >
      <EditableNodeTitle nodeId={id} value={data.customName} fallback="Card" />
      <div className="node-body node-card-body">
        <div className="node-card-summary">
          <div className="node-card-thumb" aria-hidden>
            {hasImage ? (
              <img src={data.url} alt="" draggable={false} />
            ) : (
              <span />
            )}
          </div>
          <div className="node-card-copy">
            <div className="node-card-title">
              <NodeText text={title} />
            </div>
            <div className="node-card-description">
              <NodeText text={description || 'Enter description'} />
            </div>
          </div>
        </div>

        {hasButtons ? (
          <div className="node-card-buttons">
            {data.buttons.map((button) => (
              <div key={button.id} className="node-card-button">
                <span>
                  <NodeText text={button.label || 'Button'} />
                </span>
                <SourceHandle
                  id={button.id}
                  className="node-handle node-card-button-handle"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="node-card-empty">Add a button in the inspector.</div>
        )}
      </div>

      <NodePorts ports={fallbackPorts(data)} />
      <Handle type="target" position={Position.Left} className="node-handle" />
      {!hasButtons && (
        <SourceHandle className="node-handle" />
      )}
    </div>
  );
};

export default CardNode;
