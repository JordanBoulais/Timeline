import React, {useRef} from 'react';
import '../css/Utils.css';
import '../css/BoardGame.css';
import imageMap from "./ImageMap.jsx"

function WinnerPopUp({isVisible, winners, }){

    if (!isVisible) return null;

    const prevIsVisible = useRef(isVisible);
    const audio = new Audio(imageMap["applause.mp3"]);
    audio.volume = 0.1;
    audio.play()

    let winner_str = "";
    if (winners.length === 1){
        winner_str = `${winners[0]} Has won!`
    } else{
        winner_str = `${winners.join(", ")} have won!`
    }

    return (
      <div className="popup">
              <label>
                  {winner_str}
              </label>
      </div>
    );

}

export default WinnerPopUp;