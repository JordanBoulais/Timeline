import "../css/Tile.css"
import React from "react";
import api from "../services/api.js";

class Tile extends React.Component{

    constructor(props){
        super(props);
        this.state = {
            timelineCallBack : props.timelineCallBack
        }
    }

     handleClick = async (e) => {

        this.state.timelineCallBack(this.props.index)
        };

    render(){

        let index = this.props.index
        let is_hint = this.props.hint_tiles.includes(index);
        let className = "tile";

        if ((! is_hint) && (! this.props.isPlayersTurn)){
            className = "tile-disabled"
        } else if (is_hint && this.props.isPlayersTurn){
            className = "hint-tile"
        } else if (is_hint && (! this.props.isPlayersTurn)){
            className = "hint-tile-disabled"
        }

        return (
            <div className={className}
                 onClick={this.handleClick}>
            </div>
        ) };

}


export default Tile