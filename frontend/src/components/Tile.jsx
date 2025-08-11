import "../css/Tile.css"
import React from "react";

function Tile({timelineCallBack, index, overTile, isPlayersTurn, setNodeRef, hint_tiles}){

    const handleClick = async (e) => {
        timelineCallBack(index)
    };

    let is_hint = hint_tiles.includes(index);
    let className = "tile";

    if ((! is_hint) && (! isPlayersTurn)){
        className = "tile-disabled"
    } else if (is_hint && isPlayersTurn){
        className = "hint-tile"
    } else if (is_hint && (! isPlayersTurn)){
        className = "hint-tile-disabled"
    }

    let tileStyle = (index !== overTile) ? {} : { width: '5px' };
    return (
    <div className={className}
         ref={setNodeRef}
         onClick={handleClick}
         style={tileStyle}
    >
    </div>
    )
}


export default Tile