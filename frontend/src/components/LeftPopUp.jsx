import React from 'react';
import '../css/Utils.css';
import '../css/BoardGame.css';


function LeftPopUp({isVisible, player_left}){

    if (!isVisible){
        return null;
    }

    return (
        <div className="popup">
            <label>
                {player_left} Has left!!!
            </label>
        </div>
    )
}

export default LeftPopUp;
