import GuessCardHand from "./GuessCardHand.jsx";
import "../css/Hand.css"
import "../css/Utils.css"
import React, {useEffect} from "react";
import api from "../services/api.js";
import HintButton from "../components/HintButton.jsx";
import PlayersTurn from "./PlayersTurn.jsx";

class Hand extends React.Component{

    constructor(props){

        super(props);

        this.state = {
            cards : props.cards,
            updateHandCards : props.updateHandCards,
            setHintTiles : props.setHintTiles
        }
    }

  handleCardClick = () => {
    this.state.updateHandCards()
  };

    render(){

        let cards = this.props.cards
        let hands = this.props.hands

        hands = Object.values(hands);

        return (
            <div className="hand-container">
                <div className="hand">
                    {cards.map((card) =>
                        (<GuessCardHand
                                key={`${card.title}-${card.year}`}
                                title={card.title}
                                year={card.year}
                                img={card.img}
                                new_to_hand={card.title === this.props.new_to_hand}
                                player_name={this.props.player_name}
                                gameId={this.props.gameId}
                                selected={card.selected}
                                handCallBack={this.handleCardClick}
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

                <div className="horizontal-div">
                    {hands.map((hand) =>
                        (<PlayersTurn
                                playersTurn={this.props.playersTurn}
                                player={hand.player.name}
                                cardsNum={hand.cards.length}
                            />
                        ))}
                </div>

            </div>
        )
    };
}

export default Hand