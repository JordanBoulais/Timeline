import "../css/TimeLine.css"
import React, {useContext} from "react";
import GuessCardTimeLine from "./GuessCardTimeLine.jsx";
import {DroppableTileWrapper} from "./DroppableTileWrapper.jsx";
import {BoardGameContext} from "../pages/BoardGame.jsx";

function TimeLineRow({startIndex,
                     cards}){

    const {maxCardsPerRow} = useContext(BoardGameContext);

    let row = startIndex;
    let startIndexByRow = row*maxCardsPerRow;

    const {overTile} = useContext(BoardGameContext);

        return (
    <div className="timeline-row">
        <DroppableTileWrapper
            index={startIndexByRow}
            row={row}
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
                />
            </React.Fragment>
        ))}
    </div>
    )
}

export default TimeLineRow