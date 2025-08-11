import React from "react";
import "../css/GameLobby.css"
import "../css/Utils.css"
import PlayerCard from "../components/PlayerCard.jsx";
import {NavigateWrapper} from "./NavigateWrapper.jsx";
import RandomLineBackground from "../components/RandomLineBackground.jsx";
import SeparatorLine from "../components/SeparatorLine.jsx";
import LeaveButton from "../components/LeaveButton.jsx";
import JoinPopUp from "../components/GameLobbyPopUp.jsx";

import api from "../services/api.js";
import { WebSocketContextObj } from './WebSocketContext.jsx';
import GameLobbyPopUp from "../components/GameLobbyPopUp.jsx";


class GameLobby extends React.Component{
    static contextType = WebSocketContextObj;

    constructor(props){
        super(props);
        this.setDefaultStates()
        this.ws = null;
    }

    setDefaultStates = () => {
        this.state = {
            player : "",
            gameId : "",
            host : "",
            players : [],
            decks : [],
            selected_deck : "",
            hand_size : 5,
            hints : 1,
            bg_color : [Math.random()*255, Math.random()*255, Math.random()*255],
            password: "",
            lastJoin : "",
            lastLeft : "",
        }
    }

    handlePageReload = (event) => {
        localStorage.setItem("gameID", this.state.gameId);
        localStorage.setItem("player", this.state.player);
        const message = {
          type: "someone_page_refresh",
        };

        this.ws.send(JSON.stringify(message));
    }

    componentWillUnmount() {
        window.removeEventListener("popstate", this.handleLeave);
        window.removeEventListener("beforeunload", this.handlePageReload);
        this.setDefaultStates()
    }

    componentDidMount() {
        const {state} = this.props.location;
        const gameId = state?.gameId || localStorage.getItem("gameID") || "";
        const player = state?.player || localStorage.getItem("player") || "";

        localStorage.setItem("gameID", "");
        localStorage.setItem("player", "");
        window.history.pushState(null, null, window.location.href);
        window.addEventListener("popstate", this.handleLeave);
        window.addEventListener("beforeunload", this.handlePageReload);

        this.setState({
            player : player,
        });

        // Init websocket
        try{
        if (this.ws == null){
            this.context.connect(`ws://localhost:8000/ws/game/${gameId}/${player}`);
            this.ws = this.context.getSocket();
        }} catch (e){
            this.props.navigate("/");
        }
    // Websockets communications
    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "player_joined") {
        this.setState({
            players: data.players,
            host : data.host.name,
            lastJoin : data.player_joined
        });
      }
      // Player has left
    else if (data.type === "player_left") {
        this.setState({
            players : data.players,
            host : data.host.name,
            lastLeft : data.player_left
        })}
      else if (data.type === "input_updated") {
        this.setState({   selected_deck: data.selected_deck,
                                hand_size: data.hand_size,
                                hints : data.hints,
                                password : data.password
        });
      }
      else if (data.type === "navigate_to_board_game") {
          // Navigate to game lobby
          this.props.navigate("/board_game",
              {
                  state: {
                      gameId: this.state.gameId,
                      player: this.state.player
                  }
              });
      }};

                const get_lobby_init_values = async (gameId) => {
            try {
                const response = await api.get("/init_lobby",  {
                  params: {
                    game_id: gameId
                  },
                })

                this.setState({ gameId : gameId,
                                    decks : response.data.decks,
                                    hand_size : response.data.hand_size,
                                    hints : response.data.hints,
                                    password : response.data.password,
                                    selected_deck : response.data.decks[0],
                                    players : response.data.players,
                                    host : response.data.host.name
                        });
            } catch (error) {
                alert(error)
                console.error('Error Initiating lobby')
                return
            }
        };

    get_lobby_init_values(gameId);



    };


    handleDeckSelectChange = (event) => {

        this.setState({ selected_deck: event.target.value }, () => {
            this.handleInputChange(); // will now use the updated state
        });

    };

    handleStartingCardNumberChange = (event) => {

        this.setState({ hand_size: parseInt(event.target.value) }, () => {
            this.handleInputChange(); // will now use the updated state
        });

    };

    handleHintsChange = (event) => {
    this.setState({ hints: parseInt(event.target.value) }, () => {
        this.handleInputChange(); // will now use the updated state
    });
    };

    handlePasswordChange = (event) => {
        this.setState({ password: event.target.value }, () => {
        alert("Password Changed")
        this.handleInputChange(); // will now use the updated state
    });

    };

    handleInputChange = () => {
        const message = {
          type: "input_updated",
            game_id : this.state.gameId,
            selected_deck : this.state.selected_deck,
            hand_size : this.state.hand_size,
            hints : this.state.hints,
            password : this.state.password
        };

        this.ws.send(JSON.stringify(message));
    }

    handleStartGame = (event) =>{

        const gameStart = async () => {
        let response;
        try {
            response = await api.post("/game_start", {
                id : this.state.gameId,
                timeline : null,
                players : this.state.players,
                deck : this.state.selected_deck,
                hints : this.state.hints,
                hand_size : this.state.hand_size,
                players_turn : "",
                current_player : {id: "", name: this.state.player},
                host : {id: "", name: ""},
                hands : {},
                password : "",
                decks : [],
            })

            const message = {
                type: "navigate_to_board_game",
            };

            this.ws.send(JSON.stringify(message));

        } catch (error){
            alert(error)
            console.error('Error Starting Game')
            return
        }}
        gameStart()
    }

    handleLeave = () => {
        this.ws.close();
        this.props.navigate("/",
          {});
    }

    resetLastJoinLeft = () => {
        this.setState({lastJoin : "",
                            lastLeft : ""
        })
    }

    render() {

        let {gameId, players, decks, hand_size, hints, host, player, lastJoin, lastLeft} = this.state;

        let is_host = (host === player);

        if (players.length === 0){
            return;
        }

        let message = "";
        if (lastJoin !== "" && lastJoin !== player){
            message = `${lastJoin} Has Joined!`

        } else if (lastLeft !== "" && lastLeft !== player){
            message = `${lastLeft} Has Left!`
        }

        let PopUpIsVisible = message !== "";

        return (
            <div className="game-lobby">

                <div className="bg-color"
                     style={{
                         backgroundColor: `rgb(${this.state.bg_color[0]},
                                            ${this.state.bg_color[1]},
                                             ${this.state.bg_color[2]})`
                     }}
                />

                <RandomLineBackground/>

                <div className="vertical-div">
                    <div className="player-card-frame">
                        {players.map((player) =>
                            (<PlayerCard key={player.name} name={player.name}/>
                            ))}
                    </div>
                    <div className="horizontal-div">
                        <SeparatorLine/>
                        <p className="custom-label"
                           style={{
                               opacity: 1,
                               userSelect: false
                           }}
                        >{this.state.players.length}/4</p>
                        <SeparatorLine/>
                    </div>
                     {is_host &&
                <div className="vertical-div">
                    <label className="custom-label">
                        Password
                    </label>
                    <input className="custom-input"
                           type="text"
                           maxLength="15"
                        style={{
                            width: "200px"
                            }}
                          onBlur={this.handlePasswordChange}
                           defaultValue={this.state.password}
                    />
                </div>}
                </div>

                <div className="vertical-div">
                    <p className="custom-label">Deck</p>
                    <select disabled={!is_host}
                            className="custom-select"
                            onChange={this.handleDeckSelectChange}
                            style={{boxShadow: '5px 5px 10px rgba(0, 0, 0, 0.4)'}}
                    >
                        {decks.map((deck) => (
                            <option key={deck} value={deck}>
                                {deck}
                            </option>
                        ))}

                    </select>
                </div>
                <div className="vertical-div">
                    <p className="custom-label">Hand Size</p>
                    <input disabled={!is_host}
                           type="number"
                           className="custom-input"
                           min="1"
                           max="8"
                           step="1"
                           value={hand_size}
                           onChange={this.handleStartingCardNumberChange}
                           style={{boxShadow: '5px 5px 10px rgba(0, 0, 0, 0.4)'}}
                    />
                </div>
                <div className="vertical-div">
                    <p className="custom-label">Hints</p>
                    <input disabled={!is_host}
                           type="number"
                           className="custom-input"
                           min="0"
                           max="10"
                           step="1"
                           value={hints}
                           onChange={this.handleHintsChange}
                           style={{boxShadow: '5px 5px 10px rgba(0, 0, 0, 0.4)'}}
                    />
                </div>

                <div className="vertical-div">
                    {is_host &&
                    <button
                        disabled={!is_host}
                        className="home-button" onClick={this.handleStartGame}>Start Game
                    </button>}
                    <LeaveButton
                        handleLeave={this.handleLeave}
                    />
                </div>

                <GameLobbyPopUp
                    reset={this.resetLastJoinLeft}
                    isVisible={PopUpIsVisible}
                    message={message}
                />

            </div>
        )
    }
}

export default NavigateWrapper(GameLobby)
