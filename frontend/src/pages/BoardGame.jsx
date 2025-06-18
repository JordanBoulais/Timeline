import GuessCardHand from "../components/GuessCardHand.jsx";
import Hand from "../components/Hand.jsx";
import api from "../services/api.js"
import TimeLine from "../components/TimeLine.jsx";
import "../css/Tile.css"

function BoardGame(){

    const GiveStartingHands = async () => {

        try {
            const reponse = await api.get("/starting_hands")
            setStartingHands(reponse);
        } catch (error){
            console.error('Error fetching starting hands')
        }

    }

    // Gives starting hand here
    // GiveStartingHands();

    // Display Hands here
    return(
        <div className="board-game">
            <TimeLine/>
            <Hand />
        </div>
    )
}

export default BoardGame
