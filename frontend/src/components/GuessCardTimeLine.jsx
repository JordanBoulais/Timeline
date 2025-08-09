import React from "react";
import "../css/GuessCard.css"
import imageMap from "./ImageMap.jsx"

class GuessCardTimeLine extends React.Component {

    constructor(props) {
        super(props);

            this.state = {
                title: props.title,
                year: props.year, // you can use props to initialize state
                img : props.img,
                showYear : true
        };

    }


    render(){

    let fontSize = 25 - this.state.title.length * 0.3

    let index = this.props.index
    let overTile = this.props.overTile

    let xOffset = 0;

    if (index === overTile){
        xOffset = 5;
    } else if (index  === (overTile - 1)){
        xOffset = -5;
    }

    return(
        <div className="guess-card-timeline"
            style={{
                transform : `translate(${xOffset}px, 0px)`
            }}
        >

            <div className="bg-image"
                 style={{
                     backgroundImage: `url(${imageMap[this.state.img]})`
                 }}/>

            <div className="guess-title"
                style={{fontSize : `${fontSize}px`}}
                >{this.state.title}</div>
            <div className="guess-year">{this.state.year}</div>
        </div>
    )
    };

}

export default GuessCardTimeLine