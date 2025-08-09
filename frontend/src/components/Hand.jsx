import GuessCardHand from "./GuessCardHand.jsx";
import "../css/Hand.css"
import "../css/Utils.css"
import React, {useEffect} from "react";
import api from "../services/api.js";
import HintButton from "../components/HintButton.jsx";
import PlayersTurn from "./PlayersTurn.jsx";
import DraggableCardWrapper from "./DraggableCardWrapper.jsx";
import {DndContext} from "@dnd-kit/core";
import SeparatorLine from "./SeparatorLine.jsx";

class Hand extends React.Component{

    constructor(props){

        super(props);

        this.state = {
            cards : props.cards,
            setHintTiles : props.setHintTiles
        }
    }



    render(){

        let cards = this.props.cards
        let hands = this.props.hands

        hands = Object.values(hands);

        return (
            <div className="hand-container">

                {/*<p className="custom-label">{this.props.player_name}</p>*/}

                <div className="hand">
                    {cards.map((card) => (
                        <DraggableCardWrapper
                            key={`${card.title}-${card.year}`}
                            title={card.title}
                            year={card.year}
                            img={card.img}
                            new_to_hand={card.title === this.props.new_to_hand}
                            player_name={this.props.player_name}
                            gameId={this.props.gameId}
                            selected={card.selected}
                            isPlayersTurn={this.props.isPlayersTurn}
                        />
                    ))}
                </div>

                <HintButton
                    playerName={this.props.player_name}
                    remaining={this.props.Hints}
                    setHintTiles={this.state.setHintTiles}
                    gameId={this.props.gameId}
                    isPlayersTurn={this.props.isPlayersTurn}
                />

            </div>
        )
    };
}

export default Hand