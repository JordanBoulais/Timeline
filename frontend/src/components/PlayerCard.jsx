import React from "react";

class PlayerCard extends React.Component{

    constructor(props){
        super(props);
        this.state = {
            name : props.name,
            img : "",
        }
    }

    render(){
        return(
        <div className="player-card">
            <p className="player-name">{this.state.name}</p>
        </div>
    );
    }


}


export default PlayerCard