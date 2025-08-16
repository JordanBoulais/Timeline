import React from "react";
import "../css/leaveButton.css"
import imageMap from "./ImageMap.jsx";

function LeaveButton({handleLeave, scaleFactor}) {
  return (
    <div className="leave-button" onClick={handleLeave}
        style={{
            transform : `scale(${scaleFactor}) translate(0px, ${1/scaleFactor * -12}px) `
        }}>
      <div
        className="leave-button-image"
        style={{
          backgroundImage: `url(${imageMap["leave_button.png"]})`,
        }}
      />
    </div>
  );
}

 export default LeaveButton


