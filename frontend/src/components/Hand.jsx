// import GuessCardHand from "./GuessCardHand.jsx";
// import "../css/Hand.css"
// import {useEffect, useState} from "react";
//
// function Hand(){
//
//     const cards = [
//     {id: 1, title: "Fall of the Roman Empire", year: 476},
//     {id : 2, title: "Discovery of America by Columbus", year: 1492}
//     ];
//
//     const [myCards, setCards] = useState([]);
//     const[error, setError] = useState(null);
//     const[loading, setLoading] = useState(true)
//
//     useEffect(() => {
//         //    try{
//         // const loadGuesses = async () => {
//         //
//         //  }
//         // }
//     }, []);
//
//
//     return (
//         <div className="hand">
//             {cards.map((card) => (<GuessCardHand guess={card} key={card.id}/>
//             ))}
//         </div>
//     )
//
//
// }


import GuessCardHand from "./GuessCardHand.jsx";
import "../css/Hand.css"
import React from "react";

class Hand extends React.Component{

    constructor(props){
        super(props);
        this.cards = [
            {id: 1, title: "Fall of the Roman Empire", year: 476},
            {id : 2, title: "Discovery of America by Columbus", year: 1492}
        ]
    }

    addCard(card){
        this.cards.push(card)
    }

    setCards(cards){
        this.cards = cards
    }

    render(){
        return (
            <div className="hand">
                {this.cards.map((card) => (<GuessCardHand title={card.title} year={card.year}/>
                ))}
            </div>
        ) };

}




export default Hand