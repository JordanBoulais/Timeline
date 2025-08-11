import React from "react";
import "../css/LeaveButton.css"
import imageMap from "./ImageMap.jsx";

function LeaveButton({handleLeave }) {
  return (
    <div className="leave-button" onClick={handleLeave}>
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


