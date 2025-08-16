import React, {useEffect, useRef, useState} from 'react';
import '../css/Utils.css';
import '../css/BoardGame.css';


function PopUp({ isVisible, message, reset}) {
  const timerRef = useRef(null);

  useEffect(() => {
    // Detect change from false -> true
    if (isVisible) {
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        if (reset) {
          reset();
        }
      }, 3000);
    }

    return () => clearTimeout(timerRef.current); // cleanup
  }, [isVisible, reset]);

  if (!isVisible) return null;

  return (
        <div className="popup">
          <div>{message}</div>
        </div>
  );
}

export default PopUp;
