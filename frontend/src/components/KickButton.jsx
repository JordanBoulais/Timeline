import React, {useContext} from "react";
import "../css/GameLobby.css"
import imageMap from "./ImageMap.jsx";
import {BoardGameContext} from "../pages/BoardGame.jsx";
import {GameLobbyContext} from "../pages/GameLobby.jsx";


function KickButton({player}){

    const {handleKick} = useContext(GameLobbyContext);

    return (
        <div className="kick-button">
            <div className="kick-image"
                 onClick={() => {handleKick(player)}}
                 style={{
                     backgroundImage: `url(${imageMap["kick_button.png"]})`
                 }}
                >
            </div>
        </div>
    )


}

export default KickButton