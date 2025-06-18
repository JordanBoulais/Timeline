import "../css/TimeLine.css"
import React from "react";
import Tile from "./Tile.jsx";
import GuessCardHand from "./GuessCardHand.jsx";
import GuessCardTimeLine from "./GuessCardTimeLine.jsx";

class TimeLine extends React.Component{

    constructor(props){
        super(props);

    }

    render(){
        return (
            <div className="timeline">
                <Tile />
                <GuessCardTimeLine title="dsadasdas" year="50"/>
                <Tile />
            </div>
        ) };

}




export default TimeLine