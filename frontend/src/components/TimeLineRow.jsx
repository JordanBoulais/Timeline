import "../css/TimeLine.css"
import React from "react";
import Tile from "./Tile.jsx";
import GuessCardTimeLine from "./GuessCardTimeLine.jsx";
import {DroppableTileWrapper} from "./DroppableTileWrapper.jsx";


class TimeLineRow extends React.Component {

        constructor(props) {
        super(props);
        this.state = {
            gameId : props.gameId,
            handleTileClick : props.handleTileClick,
        }
    }

    render(){

        let row = this.props.startIndex;
        let cards = this.props.cards;

        let startIndex = row*8;

    return (
    <div className="timeline-row">
        <DroppableTileWrapper
            index={startIndex}
            row={row}
            timelineCallBack={this.props.handleTileClick}
            hint_tiles={this.props.hintTiles}
            isPlayersTurn={this.props.isPlayersTurn}
            overTile={this.props.overTile}
        />
        {cards.map((card, index) => (
            <React.Fragment key={card.title}>
                <GuessCardTimeLine
                    index={startIndex+index}
                    overTile={this.props.overTile}
                    title={card.title}
                    year={card.year}
                    img={card.img}
                />
               <DroppableTileWrapper
                    row={row}
                    index={index+1+startIndex}
                    timelineCallBack={this.props.handleTileClick}
                    hint_tiles={this.props.hintTiles}
                    isPlayersTurn={this.props.isPlayersTurn}
                    overTile={this.props.overTile}
                />
            </React.Fragment>
        ))}
    </div>
    )

    }
}


export default TimeLineRow