import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import GuessCardHand from './GuessCardHand';

function DraggableCardWrapper(props) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: JSON.stringify({ title: props.title, year: props.year })
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 1 : 1,
    touchAction: 'none',
    cursor: 'grab',
  };

  return (
    <div ref={setNodeRef}
         style={style}

         // Disabling dragNdrop if not player's turn
         {...(props.isPlayersTurn ? listeners : {})}
         {...attributes}>
      <GuessCardHand {...props} />
    </div>
  );
}

export default DraggableCardWrapper;
