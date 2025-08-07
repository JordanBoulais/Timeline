import React from 'react';
import '../css/Utils.css';
import '../css/Home.css';

class HomePagePassword extends React.Component {

        constructor(props) {
        super(props);
        this.state = {
          handleGamePasswordChanged: props.handleGamePasswordChanged,
            handlePasswordPopUpClose: props.handlePasswordPopUpClose,
            handleJoin : props.handleJoin
        };
    }

  render() {
    if (!this.props.isVisible) return null; // don't render if not visible

    return (
      <div className="popup-backdrop">
          <div className="vertical-div">
              <label className="name-input-label">
                  Enter Game Password
              </label>
              <input className="name-input" type="text" onChange={this.state.handleGamePasswordChanged}/>
              <button className="popup-button" onClick={this.props.handleJoin}>Join</button>
              <button className="popup-button" onClick={this.props.handlePasswordPopUpClose}>Close</button>
          </div>
      </div>
    );
  }
}

export default HomePagePassword;