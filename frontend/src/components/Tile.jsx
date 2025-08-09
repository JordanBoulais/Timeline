import "../css/Tile.css"
import React, {useLayoutEffect} from "react";
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
        let overTile=this.props.overTile
        let is_hint = this.props.hint_tiles.includes(index);
        let className = "tile";

        if ((! is_hint) && (! this.props.isPlayersTurn)){
            className = "tile-disabled"
        } else if (is_hint && this.props.isPlayersTurn){
            className = "hint-tile"
        } else if (is_hint && (! this.props.isPlayersTurn)){
            className = "hint-tile-disabled"
        }

        let tileStyle = (index !== overTile) ? {} : { width: '5px' };
        return (
            <div className={className}
                 ref={this.props.setNodeRef}
                 onClick={this.handleClick}
                 style={tileStyle}
            >
            </div>
        ) };

}


export default Tile