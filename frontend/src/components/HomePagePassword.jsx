import React from 'react';
import '../css/Utils.css';
import '../css/Home.css';

function HomePagePassword({isVisible,
                          handleGamePasswordChanged,
                          handleJoin,
                          handlePasswordPopUpClose}){
        if (!isVisible) return null; // don't render if not visible

        return (
      <div className="popup-backdrop">
          <div className="vertical-div">
              <label className="name-input-label">
                  Enter Game Password
              </label>
              <input className="name-input" type="text" onChange={handleGamePasswordChanged}/>
              <button className="popup-button" onClick={handleJoin}>Join</button>
              <button className="popup-button" onClick={handlePasswordPopUpClose}>Close</button>
          </div>
      </div>
    );
}

export default HomePagePassword;