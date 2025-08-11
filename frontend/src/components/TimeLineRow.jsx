import "../css/TimeLine.css"
import React from "react";
import GuessCardTimeLine from "./GuessCardTimeLine.jsx";
import {DroppableTileWrapper} from "./DroppableTileWrapper.jsx";

function TimeLineRow({startIndex,
                     cards,
                     handleTileClick,
                     hintTiles,
                     isPlayersTurn,
                     overTile}){

    let row = startIndex;
    let startIndexByRow = row*8;

        return (
    <div className="timeline-row">
        <DroppableTileWrapper
            index={startIndexByRow}
            row={row}
            timelineCallBack={handleTileClick}
            hint_tiles={hintTiles}
            isPlayersTurn={isPlayersTurn}
            overTile={overTile}
        />
        {cards.map((card, index) => (
            <React.Fragment key={card.title}>
                <GuessCardTimeLine
                    index={startIndexByRow+index}
                    overTile={overTile}
                    title={card.title}
                    year={card.year}
                    img={card.img}
                />
               <DroppableTileWrapper
                    row={row}
                    index={index+1+startIndexByRow}
                    timelineCallBack={handleTileClick}
                    hint_tiles={hintTiles}
                    isPlayersTurn={isPlayersTurn}
                    overTile={overTile}
                />
            </React.Fragment>
        ))}
    </div>
    )
}

export default TimeLineRow