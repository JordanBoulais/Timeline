import React, {useContext} from "react";
import KickButton from "./KickButton.jsx";


function PlayerCard({player, name, host}){

    return(
        <div className="player-card-container"
        >
            {name === host &&
                <div
                    style={{
                        position : "relative",
                        transform : "translate(0%, 0px)"
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