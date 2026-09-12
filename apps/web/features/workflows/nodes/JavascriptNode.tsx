import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';
import type { JavascriptNodeData } from '../lib/types';
import EditableNodeTitle from './EditableNodeTitle';
import NodePorts from './NodePorts';
import Icon from './StepIcon';
import { useOpenCodeEditor } from './CodeEditorContext';

/**
 * The code step.
 *
 * The card says what the step is, not what it contains: a three-line preview
 * of minified-looking JavaScript told you nothing at canvas zoom and made the
 * node taller than every neighbour. What it needs to say is whether anything
 * has been written yet, which is the difference between the two captions.
 */
const JavascriptNode = ({ id, data }: NodeProps<JavascriptNodeData>) => {
  const hasCode = Boolean((data.code ?? '').trim());
  const openCodeEditor = useOpenCodeEditor();

  return (
    <div className={`node node-javascript node-color-${data.blockColor ?? 'default'}`}>
      <EditableNodeTitle nodeId={id} value={data.customName} fallback="Code" />
      <div className="node-body node-code-body">
        <span className="node-code-badge" aria-hidden>
          <Icon name="javascript" size={14} />
        </span>
        <span className={`node-code-label ${hasCode ? '' : 'is-empty'}`}>
          {hasCode ? 'Custom code' : 'Add JavaScript'}
        </span>
        {openCodeEditor && (
          <button
            type="button"
            className="node-code-expand"
            title="Open the editor full window"
            aria-label="Open the editor full window"
            onClick={(event) => {
              event.stopPropagation();
              openCodeEditor(id);
            }}
          >
            <Icon name="fit" size={14} />
          </button>
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

export default JavascriptNode;
