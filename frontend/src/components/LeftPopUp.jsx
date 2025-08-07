import React from 'react';
import '../css/Utils.css';
import '../css/BoardGame.css';

class LeftPopUp extends React.Component {

        constructor(props) {
        super(props);
        this.state = {
            handlePopUpClose: props.handlePopUpClose,
        };
    }

  render() {
    if (!this.props.isVisible) return null; // don't render if not visible

    return (
      <div className="popup">
              <label>
                  {this.props.player_left} Has left!!!
              </label>
      </div>
    );
  }
}

export default LeftPopUp;