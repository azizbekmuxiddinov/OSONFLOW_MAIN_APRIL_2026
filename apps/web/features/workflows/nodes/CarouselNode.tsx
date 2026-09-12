import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';
import { fallbackPorts, type CarouselNodeData } from '../lib/types';
import { htmlToTemplateText } from '../lib/variable-tokens';
import EditableNodeTitle from './EditableNodeTitle';
import NodeText from './NodeText';
import NodePorts from './NodePorts';
import SourceHandle from './SourceHandle';

const CarouselNode = ({ id, data }: NodeProps<CarouselNodeData>) => {
  const cards = data.cards ?? [];
  const multiple = cards.length > 1;

  // Ports are listed once, below the track. Nesting them inside the
  // horizontally scrolling cards would scatter the handles across the node.
  const ports = cards.flatMap((card, index) =>
    card.buttons.map((button) => ({
      id: button.id,
      label: multiple ? `${index + 1} · ${button.label}` : button.label,
    }))
  );

  return (
    <div className={`node node-carousel node-color-${data.blockColor ?? 'default'}`}>
      <EditableNodeTitle nodeId={id} value={data.customName} fallback="Carousel" />
      <div className="node-body">
        {cards.length === 0 ? (
          <div className="node-empty">Add cards in the inspector.</div>
        ) : (
          /* Cards stack as rows, each a thumbnail beside its own title and
             description, so a carousel reads the same as a Card node
             repeated rather than as a sideways filmstrip. */
          <div className="node-carousel-list">
            {cards.map((card) => (
              <div className="node-carousel-row" key={card.id}>
                <div className="node-card-thumb" aria-hidden>
                  {card.url?.trim() ? (
                    <img src={card.url} alt="" draggable={false} />
                  ) : (
                    <span />
                  )}
                </div>
                <div className="node-card-copy">
                  <div className="node-card-title">
                    <NodeText text={card.title?.trim() || 'Untitled card'} />
                  </div>
                  <div className="node-card-description">
                    <NodeText
                      text={
                        htmlToTemplateText(card.description ?? '') ||
                        'Enter description'
                      }
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        <NodePorts ports={ports} />
      </div>
      <NodePorts ports={fallbackPorts(data)} />
      <Handle type="target" position={Position.Left} className="node-handle" />
      {ports.length === 0 && (
        <SourceHandle className="node-handle" />
      )}
    </div>
  );
};

export default CarouselNode;
