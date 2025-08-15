import React, {useContext} from "react";
import KickButton from "./KickButton.jsx";


function PlayerCard({player, name, host}){

    return(
        <div className="player-card-container"
        >
            {name === host &&
                <div
                    style={{
                        position : "absolute",
                        transform : "translate(6vh, -25px)"
                }}
                >(HOST)</div>
                }

            <div className="player-card">
                {name !== host && player === host &&
                    <KickButton
                        player={name}
                    />
                }
                <p className="player-name">{name}</p>
            </div>
        </div>
    );

}

export default PlayerCard