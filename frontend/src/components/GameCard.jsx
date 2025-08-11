import React from 'react';
import '../css/Utils.css';
import '../css/Home.css';

function GameCard({game,
                  handleGameCardClick}){

    let password = "-";
    if (game.password !== ""){
        password = "*************"
    }

    return (
        <div className="game-card"
            onClick={() => handleGameCardClick(game)}
        >
            <p className="custom-label">Host : {game.host.name}</p>
            <p className="custom-label">Players : {game.players.length}/4</p>
            <p className="custom-label">Password : {password}</p>
        </div>
    );
}

export default GameCard;