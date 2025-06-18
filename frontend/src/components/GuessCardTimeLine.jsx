import React from "react";
import "../css/GuessCard.css"

class GuessCardTimeLine extends React.Component {

    constructor(props) {
        super(props);

            this.state = {
                title: props.title,
                year: props.year, // you can use props to initialize state
                showYear : true
        };

    }


    render(){
    return(
        <div className="guess-card-timeline">
                    <div className="guess-text">
                        <div className="text-holder">
                            <p className="guess-title">{this.state.title}</p>
                            <p className="guess-year">{this.state.year}</p>
                        </div>
                    </div>
        </div>
    ) };

}

export default GuessCardTimeLine