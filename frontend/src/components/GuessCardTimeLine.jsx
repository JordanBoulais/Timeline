import React from "react";
import "../css/GuessCard.css"
import imageMap from "./ImageMap.jsx"

function GuessCardTimeLine({title,
                           year,
                           img,
                           index,
                           overTile}){

    let fontSize = 25 - title.length * 0.3
    fontSize = window.innerWidth < 768 ? fontSize * 0.5 : fontSize;
    let xOffset = 0;

    if (index === overTile){
        xOffset = 5;
    } else if (index  === (overTile - 1)){
        xOffset = -5;
    }
    return(
        <div className="guess-card-timeline"
            style={{
                transform : `translate(${xOffset}px, 0px)`
            }}
        >

            <div className="bg-image"
                 style={{
                     backgroundImage: `url(${imageMap[img]})`
                 }}/>

            <div className="guess-title"
                style={{fontSize : `${fontSize}px`}}
                >{title}</div>
            <div className="guess-year">{year}</div>
        </div>
    )
}

export default GuessCardTimeLine