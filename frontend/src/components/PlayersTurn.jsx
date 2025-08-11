import React from "react";

function PlayersTurn({playersTurn, winners, player, cardsNum}){

    let isPlayersTurn = playersTurn === player;

        let className = isPlayersTurn ? "players-turn" : "not-players-turn"

        if (winners.includes(player)){
            className = "players-won"
        }

        return(
            <div className={className}>
                <p className="players-turn-text">{player}</p>
                <p className="players-turn-text">{cardsNum}</p>
            </div>
        );
}

export default PlayersTurn