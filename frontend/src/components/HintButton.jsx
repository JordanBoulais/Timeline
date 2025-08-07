import React from "react";
import "../css/hintButton.css"
import imageMap from "./ImageMap.jsx";
import api from "../services/api.js";

class HintButton extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            setHintTiles : props.setHintTiles,
            playerName : props.playerName,
            gameId : props.gameId
        }
    }

    handleClick = async (e) => {

    this.state.setHintTiles()

    }

 render(){

        let remaining = this.props.remaining
        let className = "hint-button";

        if (! this.props.isPlayersTurn){
            className = "hint-button-disabled";
        }

        return (
            <div className={className}
                 onClick={this.handleClick}>

                <div className="hint-button-image"
                     style={{
                         backgroundImage: `url(${imageMap["hints.png"]})`
                     }}/>

                    <div className="hints-number"
                        style={{position: "absolute", color: "white", fontWeight: "bold",
                        userSelect: "none", pointerEvents: "none"}}>
                        {remaining}</div>
            </div>
 )};


 }

 export default HintButton