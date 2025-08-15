import "../css/Hand.css"
import "../css/Utils.css"
import HintButton from "../components/HintButton.jsx";
import DraggableCardWrapper from "./DraggableCardWrapper.jsx";



function Hand({cards,
              newToHand,
              gameId,
              Hints,
              askHint}){

            return (
            <div className="hand-container">

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