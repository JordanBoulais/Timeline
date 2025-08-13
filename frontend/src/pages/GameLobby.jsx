import React, {useContext, useEffect, useState} from "react";
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


function GameLobby({navigate, location}){

    const wsContext = useContext(WebSocketContextObj);
    const wsRef = React.useRef(null);

    const [player, setPlayer] = useState("");
    const [players, setPlayers] = useState([]);
    const [gameId, setGameId] = useState("");
    const [host, setHost] = useState("");
    const [decks, setDecks] = useState([]);
    const [selectedDeck, setSelectedDeck] = useState("");
    const [handSize, setHandSize] = useState(5);
    const [hints, setHints] = useState(0);
    const [bgColor, setBgColor] = useState([Math.random()*255, Math.random()*255, Math.random()*255]);
    const [password, setPassword] = useState("");
    const [lastJoin, setLastJoin] = useState("");
    const [lastLeft, setLastLeft] = useState("");

    // const handlePageReload = (event) => {
    //     localStorage.setItem("gameID", gameId);
    //     localStorage.setItem("player", player);
    //     alert("handlePageReload")
    //     window.removeEventListener("beforeunload", handlePageReload);
    //     const message = {
    //         type: "someone_page_refresh",
    //     };
    //     wsRef.current.send(JSON.stringify(message));
    // }

      const handleLeave = () => {
        wsRef.current.close();
        navigate("/",
          {});
    }

    const handleDeckSelectChange = (event) => {
        handleInputChange(gameId, event.target.value, handSize, hints, password)
    };

    const handleStartingCardNumberChange = (event) => {
        handleInputChange(gameId, selectedDeck, event.target.value, hints, password)
    };

    const handleHintsChange = (event) => {
        handleInputChange(gameId, selectedDeck, handSize, event.target.value, password)
    };

    const handlePasswordChange = (event) => {
         alert("Password Changed")
        handleInputChange(gameId, selectedDeck, handSize, hints, event.target.value)
    };

    const handleInputChange = (gameId,
                               selectedDeck,
                               handSize,
                               hints,
                               password) => {
        const message = {
          type: "input_updated",
            game_id : gameId,
            selected_deck : selectedDeck,
            hand_size : handSize,
            hints : hints,
            password : password
        };
        wsRef.current.send(JSON.stringify(message));
    }

    const handleStartGame = (event) => {

        const gameStart = async () => {
        let response;
        try {
            response = await api.post("/game_start", {
                id : gameId,
                timeline : null,
                players : players,
                deck : selectedDeck,
                hints : hints,
                hand_size : handSize,
                players_turn : "",
                current_player : {id: "", name: player},
                host : {id: "", name: ""},
                hands : {},
                password : "",
                decks : [],
            })

            const message = {
                type: "navigate_to_board_game",
            };

            wsRef.current.send(JSON.stringify(message));

        } catch (error){
            alert(error)
            console.error('Error Starting Game')
        }}
        gameStart()
    }

    const resetLastJoinLeft = () => {
        setLastJoin("");
        setLastLeft("");
    }

    const getWebSocket = (gameId, player) => {
        try {
            if (wsRef.current == null && gameId && player) {
            wsContext.connect(`ws://localhost:8000/ws/game/${gameId}/${player}`);
            wsRef.current = wsContext.getSocket();
        }
        } catch (e) {
            navigate("/");
        }
    }

    const getLobbyInitValues = async (gameId) => {
      try {
        const response = await api.get("/init_lobby", {
          params: {
            game_id: gameId
          },
        });

        setGameId(gameId);
        setDecks(response.data.decks);
        setHandSize(response.data.hand_size);
        setHints(response.data.hints);
        setPassword(response.data.password);
        setSelectedDeck(response.data.decks[0]);
        setPlayers(response.data.players);
        setHost(response.data.host.name);

      } catch (error) {
        alert(error);
        console.error("Error Initiating lobby");
      }
    };

    // Mount/Unmount
    useEffect(() => {

        // window.addEventListener("beforeunload", handlePageReload);

      // Cleanup function runs on unmount
      return () => {
        // Reset states to defaults
        setPlayer("");
        setGameId("");
        setHost("");
        setPlayers([]);
        setDecks([]);
        setSelectedDeck("");
        setHandSize(5);
        setHints(0);
        setBgColor([
          Math.random() * 255,
          Math.random() * 255,
          Math.random() * 255
        ]);
        setPassword("");
        setLastJoin("");
        setLastLeft("");
      };
    }, []);

    useEffect(() => {

    }, [gameId, player])

    // // Page refreshing
    // useEffect(() => {
    //     getWebSocket()
    // }, [wsRef]);

    useEffect(() => {
        let player = location?.state?.player || localStorage.getItem("player") || "";
        let gameId = location?.state?.gameId || localStorage.getItem("gameID") || "";

        setPlayer(player);
        setGameId(gameId);
        localStorage.setItem("gameID", player);
        localStorage.setItem("player", gameId);
        // window.history.pushState(null, null, window.location.href);

        getWebSocket(gameId, player);

        // Websockets communications
        wsRef.current.onmessage = (event) => {
          const data = JSON.parse(event.data);

          if (data.type === "player_joined") {
            setPlayers(data.players);
            setHost(data.host.name);
            setLastJoin(data.player_joined);
          }
          // Player has left
          else if (data.type === "player_left") {
            setPlayers(data.players);
            setHost(data.host.name);
            setLastLeft(data.player_left);
          }
          else if (data.type === "input_updated") {
            setSelectedDeck(data.selected_deck);
            setHandSize(data.hand_size);
            setHints(data.hints);
            setPassword(data.password);
          }
          else if (data.type === "navigate_to_board_game") {
            // Navigate to game lobby
            navigate("/board_game", {
              state: {
                gameId: gameId,
                player: player
              }
            });
          }
        };

        // call it
        getLobbyInitValues(gameId);

  //     return () => {
  //   window.removeEventListener("popstate", handleLeave);
  //   window.removeEventListener("beforeunload", handlePageReload);
  // };
    }, [location]);

    let is_host = (host === player);

    if (players.length === 0){
        return (
            <div></div>
        );
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
                     backgroundColor: `rgb(${bgColor[0]},
                                            ${bgColor[1]},
                                             ${bgColor[2]})`
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
                    >{players.length}/4</p>
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
                               onBlur={handlePasswordChange}
                               defaultValue={password}
                        />
                    </div>}
            </div>

            <div className="vertical-div">
                <p className="custom-label">Deck</p>
                <select
                        value={selectedDeck}
                        disabled={!is_host}
                        className="custom-select"
                        onChange={handleDeckSelectChange}
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
                       value={handSize}
                       onChange={handleStartingCardNumberChange}
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
                       onChange={handleHintsChange}
                       style={{boxShadow: '5px 5px 10px rgba(0, 0, 0, 0.4)'}}
                />
            </div>

            <div className="vertical-div">
                {is_host &&
                    <button
                        disabled={!is_host}
                        className="home-button" onClick={handleStartGame}>Start Game
                    </button>}
                <LeaveButton
                    handleLeave={handleLeave}
                />
            </div>

            <GameLobbyPopUp
                reset={resetLastJoinLeft}
                isVisible={PopUpIsVisible}
                message={message}
            />
        </div>
    )


}

export default NavigateWrapper(GameLobby)
