import React, {useEffect, useRef, useState} from 'react';
import '../css/Utils.css';
import '../css/BoardGame.css';


function PopUp({message, reset}) {
  const timerRef = useRef(null);

  useEffect(() => {
    // Detect change from false -> true

      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        if (reset) {
          reset(message);
        }
      }, 3000);


    return () => clearTimeout(timerRef.current); // cleanup
  }, []);

  return (
        <div className="popup">
          <div>{message}</div>
        </div>
  );
}

export default PopUp;
