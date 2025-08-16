import React from 'react';
import '../css/Utils.css';
import imageMap from "./ImageMap.jsx";


function AttemptingConnexion({isVisible}){

    if (!isVisible){
        return null;
    }

    return (
        <div className="static-popup">
            <label>
                - Connexion -
            </label>

            <div className="spinner"
                 style={{
                    backgroundImage: `url(${imageMap["spinner.png"]})`
                }}/>

        </div>
    )
}

export default AttemptingConnexion;
