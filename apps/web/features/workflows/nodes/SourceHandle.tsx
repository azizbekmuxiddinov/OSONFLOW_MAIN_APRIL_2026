import { useCallback } from 'react';
import { Handle, Position, useNodeId, useStore } from 'reactflow';

/**
 * An exit port that knows whether a wire already leaves it.
 *
 * Two states: empty, drawn hollow, meaning this exit goes nowhere yet; and
 * connected, drawn filled, meaning it leads somewhere. On a branching node
 * that is the difference between a path the author finished and one they
 * forgot, which is otherwise only visible by tracing every wire by eye.
 *
 * Connectedness is read from the flow store rather than passed through node
 * `data`, on purpose: `data` is serialised into the saved workflow, and this
 * is presentation — it has no business being written to the database.
 */
const SourceHandle = ({
  id,
  className = '',
}: {
  /** Port id. Omitted on a node whose single exit carries no handle id. */
  id?: string;
  className?: string;
}) => {
  const nodeId = useNodeId();

  const isConnected = useStore(
    useCallback(
      (state) =>
        state.edges.some(
          (edge) =>
            edge.source === nodeId &&
            // A node with one unnamed exit stores no sourceHandle at all, so
            // an absent id has to match an absent handle rather than any wire
            // leaving the node — otherwise every port on a branching node
            // would light up as soon as one of them was wired.
            (id === undefined
              ? edge.sourceHandle === null || edge.sourceHandle === undefined
              : edge.sourceHandle === id),
        ),
      [id, nodeId],
    ),
  );

  return (
    <Handle
      id={id}
      type="source"
      position={Position.Right}
      className={`${className} ${isConnected ? 'is-connected' : 'is-empty'}`}
    />
  );
};

export default SourceHandle;
