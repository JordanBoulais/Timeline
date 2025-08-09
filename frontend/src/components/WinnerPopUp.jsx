import React from 'react';
import '../css/Utils.css';
import '../css/BoardGame.css';
import imageMap from "./ImageMap.jsx"

class WinnerPopUp extends React.Component {

        constructor(props) {
        super(props);
        this.state = {
          handleGameIDChange: props.handleGameIDChange,
            handlePopUpClose: props.handlePopUpClose,
            handleJoin : props.handleJoin
        };
        this.audio_path = imageMap["applause.mp3"];
        this.audio = new Audio(this.audio_path);
        this.audio.volume = 0.1;
    }

      componentDidUpdate(prevProps, prevState) {
    // Check if a specific prop has changed
    if (this.props.isVisible !== prevProps.isVisible) {
        this.audio.play();
    }
  }

  render() {
    if (!this.props.isVisible) return null; // don't render if not visible


    let winner_str = "";
    if (this.props.winners.length === 1){
        winner_str = `${this.props.winners[0]} Has won!`
    } else{
        winner_str = `${this.props.winners.join(", ")} have won!`
    }


    return (
      <div className="popup">
              <label>
                  {winner_str}
              </label>
      </div>
    );
  }
}

export default WinnerPopUp;