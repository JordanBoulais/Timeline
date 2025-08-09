import React from 'react';
import '../css/Utils.css';
import '../css/Home.css';

class GameCard extends React.Component {

        constructor(props) {
        super(props);
        this.state = {
        };
    }

  render() {


    let password = "-";
    if (this.props.game.password !== ""){
        password = "*************"
    }

    return (
        <div className="game-card"
            onClick={() => this.props.handleGameCardClick(this.props.game)}
        >
            <p className="custom-label">Host : {this.props.game.host.name}</p>
            <p className="custom-label">Players : {this.props.game.players.length}/4</p>
            <p className="custom-label">Password : {password}</p>
        </div>
    );
  }
}

export default GameCard;