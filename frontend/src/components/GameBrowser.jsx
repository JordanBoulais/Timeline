import React from 'react';
import '../css/Utils.css';
import '../css/Home.css';
import GameCard from "./GameCard.jsx"

function GameBrowser({isVisible,
                         games,
                         handleGameCardClick,
                         handleCloseGameBrowser}){

    if (!isVisible) return null; // don't render if not visible

    return (
        <div className="game-browser-window">
            <div className="game-card-container">
                {games.map((game) =>
                    (<GameCard
                            key={game.host.name}
                            game={game}
                            handleGameCardClick={handleGameCardClick}
                        />
                    ))
                }
            </div>
            <button className="close-button"
                onClick={handleCloseGameBrowser}
            >X
            </button>
        </div>
    );
}

export default GameBrowser;