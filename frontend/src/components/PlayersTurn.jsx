import React from "react";

class PlayersTurn extends React.Component{

    constructor(props){
        super(props);
        this.state = {
        }
    }



    render(){

        let isPlayersTurn = this.props.playersTurn === this.props.player;

        let className = isPlayersTurn ? "players-turn" : "not-players-turn"

        if (this.props.winners.includes(this.props.player)){
            className = "players-won"
        }

        return(
            <div className={className}>
                <p className="players-turn-text">{this.props.player}</p>
                <p className="players-turn-text">{this.props.cardsNum}</p>
            </div>
        );
    }


}


export default PlayersTurn