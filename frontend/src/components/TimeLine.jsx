import "../css/TimeLine.css"
import React from "react";
import TimeLineRow from "./TimeLineRow.jsx";
import api from "../services/api.js";

class TimeLine extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            gameId : props.gameId,
        }
    }



render() {

    let rows = this.props.rows;
    let rowCount = this.props.rowCount;
    let timelinescale = 1 - (rowCount - 1) * 0.05;
    let translateY = 15 + (rowCount - 1) * 5;

    return (
        <div className="timeline"
        style={{ transform: `translateY(${translateY}vh) scale(${timelinescale})` }}
        >

            {rows.map((row, rowIndex) => (
                <TimeLineRow
                    key={rowIndex}
                    startIndex={rowIndex}
                    cards={row}
                    game_id={this.state.gameId}
                    handleTileClick={this.props.handleTileClick}
                    hintTiles={this.props.hintTiles}
                    isPlayersTurn={this.props.isPlayersTurn}
                />
            ))}
        </div>
    );
}}


export default TimeLine;