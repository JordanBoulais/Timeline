import "../css/Hand.css"
import "../css/Utils.css"
import HintButton from "../components/HintButton.jsx";
import DraggableCardWrapper from "./DraggableCardWrapper.jsx";



function Hand({player_name,
              cards,
              new_to_hand,
              gameId,
              isPlayersTurn,
              Hints,
              askHint}){


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
                            new_to_hand={card.title === new_to_hand}
                            player_name={player_name}
                            gameId={gameId}
                            selected={card.selected}
                            isPlayersTurn={isPlayersTurn}
                        />
                    ))}
                </div>

                <HintButton
                    remaining={Hints}
                    askHint={askHint}
                    isPlayersTurn={isPlayersTurn}
                />

            </div>
        )

}

export default Hand