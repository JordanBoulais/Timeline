import React from "react";
import "../css/LeaveButton.css"
import imageMap from "./ImageMap.jsx";
import api from "../services/api.js";

class LeaveButton extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            gameId : props.gameId
        }
    }

 render(){

        return (
            <div className="leave-button"
                 onClick={this.props.handleLeave}>

                <div className="leave-button-image"
                     style={{
                         backgroundImage: `url(${imageMap["leave_button.png"]})`
                     }}/>
            </div>
 )};


 }

 export default LeaveButton