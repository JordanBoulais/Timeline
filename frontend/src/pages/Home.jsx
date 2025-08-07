import React from "react";
import "../css/Home.css"
import "../css/Utils.css"
import {NavigateWrapper} from "./NavigateWrapper.jsx";
import RandomLineBackground from "../components/RandomLineBackground.jsx";
import HomePagePassword from "../components/HomePagePassword.jsx";
import api from "../services/api.js";
import GameBrowser from "../components/GameBrowser.jsx";


class Home extends React.Component{

    constructor(props) {
        super(props);
        this.state = {
        player: "",
        password : "",
        gamePasswordPopUp : false,
        gameBrowserWindow: false,
        bg_color : [Math.random()*255, Math.random()*255, Math.random()*255],
        selected_game : {},
        games : []
        };
    }

  handleInputChange = (event) => {
    this.setState({ player: event.target.value });
  };

    handleGamePasswordChanged = (event) => {
    this.setState({ gamePassword: event.target.value });
  };


    handlePasswordPopUpClose = (event) => {
    this.setState({ gamePasswordPopUp: false,
                            password : ""});
  };

    handleJoinWithPassword = () => {

        if (this.state.gamePassword === this.state.selected_game.password){
            this.handleJoin(this.state.selected_game.id)
        } else {
            alert("Wrong Password")
        }

    }


    handleJoin = (gameId) => {

        // Add game to server
        const _handleJoin = async () => {

        const {player} = this.state
        let response;

        try {
            response = await api.post("/game_join", {
                id : gameId,
                timeline : null,
                current_player : {id: "", name: player},
                players : [{id: "", name: player}],
                host : {id: "", name: ""},
                hands : {},
                players_turn : "",
                password : "",
                deck : "",
                decks : [],
                hints : 0,
                hand_size : 0
            })

            if (response.data.id === ""){
                alert("Could Not Find Game");
                return;
            }

            else if (response.data.id === "FULL"){
                alert("Game is already full (4 Players Max.)");
                return;
            }


            // Navigate to game lobby
            this.props.navigate("/game_lobby",
                    { state: { gameId: response.data.id,
                                host : response.data.host.name,
                                player : player,
                                players : response.data.players}});

        } catch (error){
            alert(error)
            console.error('Error Initiating game')
        }}

        _handleJoin()
  };

    joinGame = () =>{

        // Check if player entered a name
        const {player} = this.state
        if (player === ""){
            alert("Enter a PlayerName");
            return;
        }
        const fetch_games = async () => {
        try{
            const response = await api.get('/get_games');
            this.setState({
            games: response.data.games,
            gameBrowserWindow : true
        });
        } catch (error) {
            console.error("Could not place card");
        }}

        fetch_games()
    }

    handleCloseGameBrowser = (event) =>{
        this.setState({
            gameBrowserWindow : false
        })
    }

    handleGameCardClick = (game) =>{
        // Join game or enter password

        if (game.password === ""){
            this.handleJoin(game.id)
        } else{
            this.setState({
                gamePasswordPopUp : true,
                selected_game : game
            })
        }
    }

    createGame = () =>{

        // Check if player entered a name
        const {player} = this.state

        if (player === ""){
            alert("Enter a PlayerName");
            return;
        }

        // Add game to server
        const gameInit = async () => {
        let response;

        try {
            response = await api.post("/game_init", {
                id : "",
                timeline : null,
                current_player : {id: "", name: player},
                players : [{id: "", name: player}],
                hands : {},
                hand_size : 0,
                players_turn : "",
                host : {id: "", name: player},
                password : "",
                deck : "",
                decks : [],
                hints : 0,
            })

            // Navigate to game lobby
            this.props.navigate("/game_lobby",
                    { state: {  gameId: response.data.id,
                                host : response.data.host.name,
                                player : player,
                                players : response.data.players}});

        } catch (error){
            alert(error)
            console.error('Error Initiating game')
        }}
        gameInit()
    }


    render() {
        return (
            <div className="home">

                <div className="bg-color"
                     style={{
                         backgroundColor: `rgb(${this.state.bg_color[0]},
                                            ${this.state.bg_color[1]},
                                             ${this.state.bg_color[2]})`
                     }}
                />

                <RandomLineBackground/>

                <GameBrowser
                    isVisible={this.state.gameBrowserWindow}
                    games={this.state.games}
                    handleCloseGameBrowser={this.handleCloseGameBrowser}
                    handleGameCardClick={this.handleGameCardClick}
                />

                <HomePagePassword
                    isVisible={this.state.gamePasswordPopUp}
                    handleGamePasswordChanged={this.handleGamePasswordChanged}
                    handlePasswordPopUpClose={this.handlePasswordPopUpClose}
                    handleJoin={this.handleJoinWithPassword}
                />

                <div className="vertical-div">
                    <label className="name-input-label">
                        Enter Name
                    </label>
                    <input className="name-input"
                           type="text"
                           id="player-name"
                           onChange={this.handleInputChange}
                            maxlength="15"/>
                </div>

                <div className="home-button-div">
                <button className="home-button" onClick={this.createGame}>Create Game</button>
                <button className="home-button" onClick={this.joinGame}>Join Game</button>
                </div>

            </div>
        )
    }
}

export default NavigateWrapper(Home);
