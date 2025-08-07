import "../css/TimeLine.css"
import React from "react";
import Tile from "./Tile.jsx";
import GuessCardTimeLine from "./GuessCardTimeLine.jsx";


class TimeLineRow extends React.Component {

        constructor(props) {
        super(props);
        this.state = {
            gameId : props.gameId,
            handleTileClick : props.handleTileClick,
        }
    }

    render(){

        let startIndex = this.props.startIndex;
        let cards = this.props.cards;

        startIndex = startIndex*8;

    return (
    <div className="timeline-row">
        <Tile index={startIndex}
              timelineCallBack={this.props.handleTileClick}
              hint_tiles={this.props.hintTiles}
              isPlayersTurn={this.props.isPlayersTurn}
        />
        {cards.map((card, index) => (
            <React.Fragment key={card.title}>
                <GuessCardTimeLine title={card.title} year={card.year} img={card.img}/>
                <Tile   index={index+1+startIndex}
                        timelineCallBack={this.props.handleTileClick}
                        hint_tiles={this.props.hintTiles}
                        isPlayersTurn={this.props.isPlayersTurn}
                />


            </React.Fragment>
        ))}
    </div>
    )

    }
}


export default TimeLineRow