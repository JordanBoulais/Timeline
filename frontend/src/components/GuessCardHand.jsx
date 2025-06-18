import React, {useState} from "react";
import "../css/GuessCard.css"

// function GuessCardHand({guess})
// {
//
//     const [showYear, setShowYear] = useState(false);
//
//
//     const handleClick = (e) => {
//         if (!showYear){
//             setShowYear(!showYear);
//         }
//
//
//         };
//
//     return(
//         <div className="guess-card" onClick={handleClick}>
//                     <div className="guess-text">
//                         <div className="text-holder">
//                             <p className="guess-title">{guess.title}</p>
//                             {showYear && <p className="guess-year">{guess.year}</p>}
//                         </div>
//                     </div>
//         </div>
//     )
// }


class GuessCardHand extends React.Component {

    constructor(props) {
        super(props);

            this.state = {
                title: props.title,
                year: props.year, // you can use props to initialize state
                showYear : false
        };

    }

    handleClick = (e) => {
        if (!this.state.showYear){
            this.setState({ showYear: true });
        }
        };

    render(){
    return(
        <div className="guess-card-hand" onClick={this.handleClick}>
                    <div className="guess-text">
                        <div className="text-holder">
                            <p className="guess-title">{this.state.title}</p>
                            {this.state.showYear && <p className="guess-year">{this.state.year}</p>}
                        </div>
                    </div>
        </div>
    ) };

}









export default GuessCardHand