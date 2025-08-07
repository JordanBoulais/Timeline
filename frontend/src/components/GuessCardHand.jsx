import React, {useState} from "react";
import "../css/GuessCard.css"
import api from "../services/api.js"
import imageMap from "./ImageMap.jsx"

class GuessCardHand extends React.Component {

    constructor(props) {
        super(props);
            this.state = {
                gameId : props.gameId,
                player_name : props.player_name,
                title: props.title,
                year: props.year,
                img: props.img,
                handCallBack : props.handCallBack,
                isDragging: false,
                mouseDown: false,
                dragStartX : 0,
                dragStartY : 0,
                dragOffsetX: 0,
                dragOffsetY: 0,
            };
    }

  componentDidMount() {
    document.addEventListener("mousemove", this.handleMouseMove);
    document.addEventListener("mouseup", this.handleMouseUp);
  }

  componentWillUnmount() {
    document.removeEventListener("mousemove", this.handleMouseMove);
    document.removeEventListener("mouseup", this.handleMouseUp);
  }

    handleMouseDown = (e) => {
    // Get offset from mouse to div corner

    this.setState({
      mouseDown: true,
      dragStartX : e.clientX,
      dragStartY : e.clientY,
    });
  };

  handleMouseMove = (e) => {
    if (e.clientX === this.state.dragStartX && e.clientY === this.state.dragStartY)
        return;

    if (!this.state.mouseDown){
        return;
    }

    this.setState({
    isDragging : true,
    dragOffsetX: e.clientX - this.state.dragStartX,
    dragOffsetY: e.clientY - this.state.dragStartY,
    });
  };


    handleMouseUp = () => {
        this.setState({
        isDragging : false,
        dragOffsetX: 0,
        dragOffsetY: 0,
    });
  };

    handleClick = async (e) => {

        this.setState({
        mouseDown : false
        });

        // Communicate with backend to change current selected card
        try{
            // Adding selection to backend
            const response = await api.post("/select_card", {
                player_name: this.state.player_name,
                game_id : this.state.gameId,
                selected_card : {title: this.state.title,
                        year : this.state.year,
                        img : this.state.img,
                        selected : true,
                        new_to_hand : false
                }});
            // Updating cards state in frontend
            this.state.handCallBack();
        } catch (error) {
            console.error("Could not remember selected card");
        }};


        handleDragStart = async (e) => {
            this.setState({
              isDragging: true,
              dragStartX : e.clientX,
              dragStartY : e.clientY,
            });
        }

        handleDragEnd = async (e) => {
            this.setState({
              isDragging: false,
              dragStartX : 0,
              dragStartY : 0,
            });
        }


    render(){

    let className = "guess-card-hand";

    if (this.props.new_to_hand){
        className = "guess-card-hand-new"
    }

    if ((! this.props.selected) && (! this.props.isPlayersTurn) ){
        className = "guess-card-hand-disabled"
    }
    else if (this.props.selected && this.props.isPlayersTurn){
        className = "guess-card-hand-selected"
    } else if (this.props.selected && (! this.props.isPlayersTurn)){
        className = "guess-card-hand-selected-disabled"
    }

    let fontSize =25 - this.props.title.length * 0.3;

    const { dragOffsetX, dragOffsetY, isDragging } = this.state;

    const dragStyle = isDragging
      ? {
        transform: `translate(${dragOffsetX}px, ${dragOffsetY}px)`,
      zIndex: -10,
      opacity: 0.5,
        }
      : {}

    return(
        <div className={className}
            onMouseDown={this.handleMouseDown}
            onMouseMove={this.handleMouseMove}
            onMouseUp={this.handleMouseUp}
            onClick={this.handleClick}
            style={dragStyle}>

            <div className="bg-image"
                 style={{
                backgroundImage: `url(${imageMap[this.props.img]})`
             }}/>

                    <div className=""
                    style={{fontSize : `${fontSize}px`,
                            top : "20%",
                            userSelect: "none",
                            }}
                    >{this.props.title}</div>

        </div>
    )
    };

}


export default GuessCardHand