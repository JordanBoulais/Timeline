import React from 'react';
import '../css/Utils.css';
import '../css/BoardGame.css';

class GameLobbyPopUp extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            mounted : false
        }
    }

  componentDidMount() {
    this.timer = setTimeout(() => {
        this.setState({mounted : true})
      this.props.reset(); // parent hides the popup
    }, 3000);
  }

    componentDidUpdate(prevProps, prevState) {

        if (!(this.props.isVisible === true
                && prevProps.isVisible === false
                && this.state.mounted === true) ){
            return
        }

    this.timer = setTimeout(() => {
      this.props.reset(); // parent hides the popup
    }, 3000);
  }

  componentWillUnmount() {
    clearTimeout(this.timer); // cleanup in case unmounted earlier
  }

  render() {
    if (!this.props.isVisible) return null;

    return (
      <div className="popup">
        <label>{this.props.message}</label>
      </div>
    );
  }
}

export default GameLobbyPopUp;
