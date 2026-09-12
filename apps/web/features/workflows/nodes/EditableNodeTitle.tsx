import {
  Fragment,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
} from 'react';
import Icon from './StepIcon';
import { useNodeRename } from './NodeRenameContext';
import { useNodeToolbarActions } from './NodeToolbarContext';

type EditableNodeTitleProps = {
  nodeId: string;
  value?: string;
  /** Only used as the rename field's starting text; never painted alone. */
  fallback: string;
  /**
   * Whether a named node paints its caption. Start draws its own label, so it
   * opts out to avoid showing the same word twice.
   */
  showName?: boolean;
};

const stopNodeInteraction = (
  event: MouseEvent<HTMLElement> | PointerEvent<HTMLElement>
) => {
  event.stopPropagation();
};

/** A press that never travelled is a click, not the start of a drag. */
const CLICK_SLOP_PX = 4;

/**
 * A node's name and its actions.
 *
 * Nodes used to paint a caption on every card — "Block", "Card", "Message" —
 * which was noise on anything the author had not named. Only a name the author
 * chose is painted now, and it stays put whether or not the pointer is near.
 *
 * Where the actions sit follows from that. A named node already has a row, so
 * rename and options fade in at the end of it on hover. An unnamed node has no
 * row to put them in, so they rise on a strip above the card instead, led by a
 * grip that doubles as the drag handle.
 */
const EditableNodeTitle = ({
  nodeId,
  value,
  showName = true,
}: EditableNodeTitleProps) => {
  const renameNode = useNodeRename();
  const openMenu = useNodeToolbarActions();
  const name = value?.trim() ?? '';
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(name);
  const inputRef = useRef<HTMLInputElement>(null);
  const pressOrigin = useRef<{ x: number; y: number } | null>(null);

  const named = showName && Boolean(name);

  useEffect(() => {
    if (!isEditing) {
      return;
    }

    requestAnimationFrame(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    });
  }, [isEditing]);

  const beginEditing = () => {
    setDraft(name);
    setIsEditing(true);
  };

  const commit = () => {
    const nextName = draft.trim();

    if (nextName !== name) {
      renameNode?.(nodeId, nextName);
    }

    setIsEditing(false);
  };

  const cancel = () => {
    setDraft(name);
    setIsEditing(false);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      commit();
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      cancel();
    }
  };

  /**
   * Press handlers shared by the caption and the grip. Neither carries
   * `nodrag`: the press has to reach React Flow so the node can still be
   * dragged from them. Only a press that stayed put counts as a click.
   */
  const pressToRename = {
    onPointerDown: (event: PointerEvent<HTMLElement>) => {
      pressOrigin.current = { x: event.clientX, y: event.clientY };
    },
    onPointerUp: (event: PointerEvent<HTMLElement>) => {
      const origin = pressOrigin.current;
      pressOrigin.current = null;

      if (!origin) return;

      const travelled =
        Math.abs(event.clientX - origin.x) + Math.abs(event.clientY - origin.y);

      if (travelled <= CLICK_SLOP_PX) {
        beginEditing();
      }
    },
    onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        beginEditing();
      }
    },
  };

  const renameField = (
    <input
      ref={inputRef}
      className="node-name-input nodrag nopan"
      value={draft}
      placeholder="Name this step"
      aria-label="Name this step"
      onPointerDown={stopNodeInteraction}
      onClick={stopNodeInteraction}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={commit}
      onKeyDown={handleKeyDown}
    />
  );

  const actions = (
    <div className="node-actions">
      <button
        type="button"
        className="node-action nodrag nopan"
        title="Rename"
        aria-label="Rename this step"
        onPointerDown={stopNodeInteraction}
        onClick={(event) => {
          stopNodeInteraction(event);
          beginEditing();
        }}
      >
        <Icon name="lineText" size={15} />
      </button>

      <button
        type="button"
        className="node-action nodrag nopan"
        title="Step options"
        aria-label="Open step options"
        onPointerDown={stopNodeInteraction}
        onClick={(event) => {
          stopNodeInteraction(event);
          const box = event.currentTarget.getBoundingClientRect();
          openMenu?.(nodeId, { x: box.left, y: box.bottom + 6 });
        }}
      >
        <Icon name="palette" size={15} />
      </button>
    </div>
  );

  if (named) {
    return (
      <div className="node-name">
        {isEditing ? (
          renameField
        ) : (
          <Fragment>
            <span
              className="node-name-text"
              role="button"
              tabIndex={0}
              title={`${name} — click to rename`}
              {...pressToRename}
            >
              {name}
            </span>
            {actions}
          </Fragment>
        )}
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="node-toolbar node-toolbar-editing">{renameField}</div>
    );
  }

  return (
    <div className="node-toolbar">
      <div
        className="node-toolbar-grip"
        role="button"
        tabIndex={0}
        title="Click to name this step"
        aria-label="Name this step"
        {...pressToRename}
      >
        <span className="node-toolbar-dots" aria-hidden />
      </div>
      {actions}
    </div>
  );
};

export default EditableNodeTitle;
