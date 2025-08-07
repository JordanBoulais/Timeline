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
    if (this.props.winner !== prevProps.winner) {
        this.audio.play();
    }
  }

  render() {
    if (!this.props.isVisible) return null; // don't render if not visible

    return (
      <div className="popup">
              <label>
                  {this.props.winner} Has Won!!!
              </label>
      </div>
    );
  }
}

export default WinnerPopUp;