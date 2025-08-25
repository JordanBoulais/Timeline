import React, {useContext} from "react";
import "../css/GuessCard.css"
import imageMap from "./ImageMap.jsx"
import {AppContext} from "../App.jsx";

function GuessCardTimeLine({title,
                           year,
                           img,
                           index,
                           overTile,
                           newCard,
                           wrongAnswer}){

    const {onMobile} = useContext(AppContext);

    let fontSize = 25 - title.length * 0.3
    fontSize = onMobile ? fontSize * 0.6 : fontSize;
    let xOffset = 0;

    if (index === overTile){
        xOffset = 5;
    } else if (index  === (overTile - 1)){
        xOffset = -5;
    }

    let className = "guess-card-timeline";

    if (title === newCard){
        className = "guess-card-timeline-new";
    }


    let bord = wrongAnswer ? "2px solid red" : "2px solid white"

    return(
        <div className={className}
             id={`${year}-timeline`}
            style={{
                transform : `translate(${xOffset}px, 0px)`,
                border : bord
            }}
        >

            <div className="bg-image"
                 style={{
                     backgroundImage: `url(${imageMap[img]})`
                 }}/>

            <div className="guess-title"
                style={{
                    fontSize : `${fontSize}px`,
                    zIndex : "1",
            }}
                >{title}</div>
            <div className="guess-year">{year}</div>
        </div>
    )
}

export default GuessCardTimeLine