import "../css/Tile.css"
import React, {useContext} from "react";
import {BoardGameContext} from "../pages/BoardGame.jsx";

function Tile({index, row, setNodeRef}){

    const {isPlayersTurn, overTile, hintTiles, wrongAnswer} = useContext(BoardGameContext);

    // const handleClick = async (index) => {
    //     handleTileClick(index)
    // };

    let is_hint = hintTiles.includes(index);
    let className = "tile";
    if (wrongAnswer){
            className = "tile-wrong-answer"
        }
    if ((! is_hint) && (! isPlayersTurn)){
        className = "tile-disabled"
        if (wrongAnswer){
            className = "tile-disabled-wrong-answer"
        }
    } else if (is_hint && isPlayersTurn){
        className = "hint-tile"
    } else if (is_hint && (! isPlayersTurn)){
        className = "hint-tile-disabled"
    }

    let tileStyle = (index !== overTile) ? {} : { width: '5px' };
    return (
    <div className={className}
         ref={setNodeRef}
         // onClick={() => handleClick(index)}
         style={tileStyle}
    >
    </div>
    )
}


export default Tile