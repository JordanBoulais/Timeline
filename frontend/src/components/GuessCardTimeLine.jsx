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

        let fontSize =25 - this.state.title.length * 0.3


    return(
        <div className="guess-card-timeline">

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