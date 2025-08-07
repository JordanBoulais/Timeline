import React from 'react';
import '../css/Utils.css';
import '../css/Home.css';
import GameCard from "./GameCard.jsx"

class GameBrowser extends React.Component {

        constructor(props) {
        super(props);
        this.state = {
        };
    }

  render() {
    if (!this.props.isVisible) return null; // don't render if not visible

    return (
        <div className="game-browser-window">
            <div className="game-card-container">
                {this.props.games.map((game) =>
                    (<GameCard
                            key={game.host.name}
                            game={game}
                            handleGameCardClick={this.props.handleGameCardClick}
                        />
                    ))
                }
            </div>
            <button className="close-button"
                onClick={this.props.handleCloseGameBrowser}
            >X
            </button>
        </div>
    );
  }
}

export default GameBrowser;