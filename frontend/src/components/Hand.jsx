import "../css/Hand.css"
import "../css/Utils.css"
import HintButton from "../components/HintButton.jsx";
import DraggableCardWrapper from "./DraggableCardWrapper.jsx";
import React, {useContext} from "react";
import {BoardGameContext} from "../pages/BoardGame.jsx";



function Hand({cards,
              newToHand,
              gameId,
              Hints,
              askHint}){

    const {isPlayersTurn, playersTurn} = useContext(BoardGameContext);

            return (
            <div className="hand-container">
                {!isPlayersTurn && (<div className="is-playing">
                    {playersTurn} Is Playing...
                </div>)}

                <div className="hand">
                    {cards.map((card) => (
                        <DraggableCardWrapper
                            key={`${card.title}-${card.year}`}
                            title={card.title}
                            year={card.year}
                            img={card.img}
                            newToHand={card.title === newToHand}
                            gameId={gameId}
                            selected={card.selected}
                        />
                    ))}
                </div>

                <HintButton
                    remaining={Hints}
                    askHint={askHint}
                />

            </div>
        )

}

export default Hand