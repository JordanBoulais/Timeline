import React, {useContext, useState} from "react";
import "../css/GuessCard.css"
import imageMap from "./ImageMap.jsx"
import {BoardGameContext} from "../pages/BoardGame.jsx";

function GuessCardHand({newToHand,
                           selected,
                           title,
                            img}){

    const {isPlayersTurn} = useContext(BoardGameContext);

    let className = "guess-card-hand";

    if (newToHand){
        className = "guess-card-hand-new"
    }
    else if (selected && isPlayersTurn){
        className = "guess-card-hand-selected"
    }

    let fontSize = 25 - title.length * 0.3;

    fontSize = window.innerWidth < 768 ? fontSize * 0.6 : fontSize;

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
                            zIndex : "1",
                            color: "white"
                            }}
                    >{title}</div>

        </div>
    )
}

export default GuessCardHand
