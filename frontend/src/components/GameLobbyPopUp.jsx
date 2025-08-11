import React, {useEffect, useRef, useState} from 'react';
import '../css/Utils.css';
import '../css/BoardGame.css';


function GameLobbyPopUp({ isVisible, message, reset }) {
  const timerRef = useRef(null);
  const prevVisibleRef = useRef(isVisible);

  useEffect(() => {
    // Detect change from false -> true
    if (isVisible && !prevVisibleRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        reset();
      }, 3000);
    }

    prevVisibleRef.current = isVisible;

    return () => clearTimeout(timerRef.current); // cleanup
  }, [isVisible, reset]);

  if (!isVisible) return null;

  return (
    <div className="popup">
      <label>{message}</label>
    </div>
  );
}

export default GameLobbyPopUp;
