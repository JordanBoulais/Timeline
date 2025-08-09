import React, {useState} from "react";
import "../css/GuessCard.css"
import imageMap from "./ImageMap.jsx"


class GuessCardHand extends React.Component {

    constructor(props) {
        super(props);
            this.state = {
                gameId : props.gameId,
                player_name : props.player_name,
                title: props.title,
                year: props.year,
                img: props.img,
                handCallBack : props.handCallBack,
            };
    }

    render(){

    let className = "guess-card-hand";

    if (this.props.new_to_hand){
        className = "guess-card-hand-new"
    }
    else if (this.props.selected && this.props.isPlayersTurn){
        className = "guess-card-hand-selected"
    }

    let fontSize =25 - this.props.title.length * 0.3;

    let disabled = (this.props.isPlayersTurn) ? {} : {
        pointerEvents: "none",
        userSelect: "none"
    }

    return(
        <div className={className}
             style={disabled}
        >

            <div className="bg-image"
                 style={{
                backgroundImage: `url(${imageMap[this.props.img]})`
             }}/>

                    <div className=""
                    style={{fontSize : `${fontSize}px`,
                            top : "20%",
                            userSelect: "none",
                            }}
                    >{this.props.title}</div>

        </div>
    )
    };

}


export default GuessCardHand