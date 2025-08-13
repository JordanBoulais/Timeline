import React from "react";
import "../css/hintButton.css"
import imageMap from "./ImageMap.jsx";

 function HintButton({askHint,
                     remaining,
                     isPlayersTurn}){

    const handleClick = async (e) => {
       await askHint()
    }

    let className = "hint-button";

    if (!isPlayersTurn){
        className = "hint-button-disabled";
    }

    return (
        <div className={className}
             onClick={handleClick}>

            <div className="hint-button-image"
                 style={{
                     backgroundImage: `url(${imageMap["hints.png"]})`
                 }}/>

                <div className="hints-number"
                    style={{position: "absolute", color: "white", fontWeight: "bold",
                    userSelect: "none", pointerEvents: "none"}}>
                    {remaining}</div>
        </div>
    )
 }

 export default HintButton