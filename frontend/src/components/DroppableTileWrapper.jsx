import React from 'react';
import { useDroppable } from '@dnd-kit/core';

import Tile from './Tile.jsx';

export function DroppableTileWrapper(props) {
  const { setNodeRef, isOver} = useDroppable({
    id: JSON.stringify({index : props.index, row : props.row})
  });

  return (
    <Tile
      {...props}
      setNodeRef={setNodeRef}
    />
  );
}
