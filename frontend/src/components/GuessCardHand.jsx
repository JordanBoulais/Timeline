import React, {useState} from "react";
import "../css/GuessCard.css"
import imageMap from "./ImageMap.jsx"

function GuessCardHand({new_to_hand,
                           selected,
                           isPlayersTurn,
                           title,
                            img}){

    let className = "guess-card-hand";

    if (new_to_hand){
        className = "guess-card-hand-new"
    }
    else if (selected && isPlayersTurn){
        className = "guess-card-hand-selected"
    }

    let fontSize =25 - title.length * 0.3;

    let disabled = (isPlayersTurn) ? {} : {
        pointerEvents: "none",
        userSelect: "none"
    }

    return(
        <div className={className}
             style={disabled}
        >

            <div className="bg-image"
                 style={{
                backgroundImage: `url(${imageMap[img]})`
             }}/>
                    <div className=""
                    style={{fontSize : `${fontSize}px`,
                            top : "20%",
                            userSelect: "none",
                            }}
                    >{title}</div>

        </div>
    )
}

export default GuessCardHand
