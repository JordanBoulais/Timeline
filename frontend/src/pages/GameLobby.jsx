import React, {createContext, useContext, useEffect, useRef, useState} from "react";
import "../css/GameLobby.css"
import "../css/Utils.css"
import PlayerCard from "../components/PlayerCard.jsx";
import {NavigateWrapper} from "./NavigateWrapper.jsx";
import RandomLineBackground from "../components/RandomLineBackground.jsx";
import SeparatorLine from "../components/SeparatorLine.jsx";
import LeaveButton from "../components/LeaveButton.jsx";

import { WebSocketContextObj } from './WebSocketContext.jsx';
import PopUp from "../components/PopUp.jsx";

export const GameLobbyContext = createContext(null);

function GameLobby({navigate, location}){

    const wsContext = useContext(WebSocketContextObj);
    const wsRef = React.useRef(null);

    const [player, setPlayer] = useState("");
    const [players, setPlayers] = useState([]);
    const [gameId, setGameId] = useState("");
    const [host, setHost] = useState("");
    const [decks, setDecks] = useState([]);

    const selectedDeck = useRef("");
    const handSize = useRef(5);
    const hints = useRef(0);
    const hintSize = useRef(2);
    const password = useState("");

    const [render, setRender] = useState("");
    const [lastJoin, setLastJoin] = useState("");
    const [lastLeft, setLastLeft] = useState("");
    const [socketId, setSocketId] = useState("");
    const [bgColor, setBgColor] = useState([Math.random()*255*0.5,
                                                        Math.random()*255*0.5,
                                                        Math.random()*255*0.5]);

    const handleLeave = (player) => {

        let message =
                    { type : "player_left",
                    player_left : player};
        wsRef.current.send(JSON.stringify(message));

        navigate("/",
          {});
    }

    const handleKick = (playerName) => {

        let message = {
                        type : "kick_player",
                        kick_player : playerName};
        wsRef.current.send(JSON.stringify(message));
    }


    const handleInputChange = () => {
        let message = {
          type: "input_updated",
            game_id : gameId,
            selected_deck : selectedDeck.current,
            hand_size : handSize.current,
            hints : hints.current,
            hint_size : hintSize.current,
            password : password.current == null ? "" : password.current
        };
        if (wsRef.current){
            wsRef.current.send(JSON.stringify(message));
        }
    }

    const handleStartGame = (event) => {

        let message = {
            type : "game_start",
            id : gameId,
            deck : selectedDeck.current,
            hints : hints.current,
            hint_size : hintSize.current,
            hand_size : handSize.current,
        }

        wsRef.current.send(JSON.stringify(message));
    }

    const resetLastJoinLeft = () => {
        setLastJoin("");
        setLastLeft("");
    }

    const getWebSocket = (socketId) => {

        wsRef.current = socketId ? wsContext.getSocket(socketId) : null;
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN){
            navigate("/");
        }
    }

    const setLobbyInitValues = (data) => {
        setGameId(data.id);
        setDecks(data.decks);
        selectedDeck.current = data.decks[0];
        handSize.current = data.hand_size
        hints.current = data.hints
        hintSize.current = data.hint_size
        password.current = data.password
        setPlayers(data.players);
        setHost(data.host.name);
    }

    const getLobbyInitValues = (gameId) => {

        let message = {
            type : "init_lobby",
            game_id : gameId
        }

        wsRef.current.send(JSON.stringify(message));
    };

  const handlePopState = (event) => {
    // Only intercept "back"
    window.history.pushState(null, "", window.location.href);
  };

    // Mount
    useEffect(() => {
        let id = location?.state?.socketId;
        getWebSocket(id)

        let player = location?.state?.player || "";
        let gameId = location?.state?.gameId || "";

        document.title = `Timeline - ${player}`

        setPlayer(player);
        setGameId(gameId);
        setSocketId(id)
        localStorage.setItem("player", player);
        localStorage.setItem("gameId", gameId);

        window.history.pushState(null, "", window.location.href);
        window.addEventListener("popstate", handlePopState);

        // Websockets inputs
        if (wsRef.current) {
            wsRef.current.onmessage = (event) => {
                const data = JSON.parse(event.data);

                if (data.type === "player_joined") {
                    setPlayers(data.players);
                    setHost(data.host.name);
                    setLastJoin(data.player_joined);
                } else if (data.type === "init_lobby") {
                    setLobbyInitValues(data)
                }
                // Player has left
                else if (data.type === "player_left") {
                    setPlayers(data.players);
                    setHost(data.host.name);
                    setLastLeft(data.player_left);
                } else if (data.type === "input_updated") {
                    // cheat to force re-render
                    selectedDeck.current = data.selected_deck;
                    handSize.current = data.hand_size;
                    hints.current = data.hints;
                    hintSize.current = data.hint_size;
                    password.current = data.password;
                    setRender(`${data.selected_deck}
                    ${data.hand_size}
                    ${data.hints}
                    ${data.hint_size}
                    ${data.password}`);
                } else if (data.type === "game_start") {

                    message = {
                        type: "navigate_to_board_game",
                    };
                    wsRef.current.send(JSON.stringify(message));
                } else if (data.type === "navigate_to_board_game") {
                    // Navigate to game lobby
                    navigate("/board_game", {
                        state: {
                            gameId: gameId,
                            player: player,
                            socketId: id
                        }
                    });
                } else if (data.type === "kick_player" && data.kick_player === player) {
                    handleLeave(player);
                }
            };

            getLobbyInitValues(gameId);

            wsRef.current.send(JSON.stringify({
                type: "player_joined",
                player_joined: player,
            }));
        }
      return () => {
          window.removeEventListener("popstate", handlePopState);
        };
    }, []);

    let is_host = (host === player);

    let message = "";
    if (lastJoin !== "" && lastJoin !== player){
        message = `${lastJoin} Has Joined!`

    } else if (lastLeft !== "" && lastLeft !== player){
        message = `${lastLeft} Has Left!`
    }

    let PopUpIsVisible = message !== "";

    return (
        <div className="game-lobby">
            <GameLobbyContext.Provider value={{handleKick: handleKick}}>
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
                        {players.map((p) =>
                            (<PlayerCard key={p.name}
                                         player={player}
                                         name={p.name}
                                         host={host}
                                />
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
                                   onBlur={(event) => {password.current = event.target.value;
                                                                                        handleInputChange()}}
                                   defaultValue={password.current}
                            />
                        </div>}
                </div>

                <div className="vertical-div">
                    <p className="custom-label">Deck</p>
                    <select
                        value={selectedDeck.current}
                        disabled={!is_host}
                        className="custom-select"
                        onChange={(event) => {selectedDeck.current = event.target.value;
                                                                                handleInputChange()}}
                        style={{boxShadow: '5px 5px 10px rgba(0, 0, 0, 0.4)',
                        backgroundColor: "rgba(0,0,0,0.1)"
                    }}
                    >
                        {decks.map((deck) => (
                            <option key={deck} value={deck}>
                                {deck}
                            </option>
                        ))}

                    </select>
                </div>
                <div className="vertical-div">
                    <label className="custom-label">
                        Hand Size
                    </label>
                    <div className="horizontal-div">
                        {is_host && (
                            <button
                                className="game-state-button"
                                onClick={() => {handSize.current = Math.max(handSize.current - 1, 1);
                                                        handleInputChange()}}
                            >-</button>
                        )}
                        <div>{handSize.current}</div>
                        {is_host && (
                            <button
                                className="game-state-button"
                                onClick={() => {handSize.current = Math.min(handSize.current + 1, 8);
                                                        handleInputChange()}}
                            >+</button>
                        )}
                    </div>
                </div>
                <div className="vertical-div">
                    <label className="custom-label">
                        Hints
                    </label>
                    <div className="horizontal-div">
                        {is_host && (
                            <button
                                className="game-state-button"
                                onClick={() => {hints.current = Math.max(hints.current - 1, 0);
                                                        handleInputChange()}}
                            >-</button>
                        )}
                        <div>{hints.current}</div>
                        {is_host && (
                            <button
                                className="game-state-button"
                                onClick={() => {hints.current = Math.min(hints.current + 1, 8);
                                                        handleInputChange()}}
                            >+</button>
                        )}
                    </div>
                </div>
                <div className="vertical-div">
                        <label className="custom-label">
                            Hint Size
                        </label>
                        <div className="horizontal-div">
                            {is_host && (
                                <button
                                    className="game-state-button"
                                    onClick={() => {hintSize.current = Math.max(hintSize.current - 1, 2);
                                                            handleInputChange()}}
                                    disabled={(hints.current == 0)}
                                >-</button>
                            )}
                            <div>{hintSize.current}</div>
                            {is_host && (
                                <button
                                    className="game-state-button"
                                    onClick={() => {hintSize.current = Math.min(hintSize.current + 1, 8);
                                                            handleInputChange()}}
                                    disabled={(hints.current == 0)}
                                >+</button>
                            )}
                        </div>
                    </div>

                    <div className="vertical-div">
                        {is_host &&
                            <button
                                disabled={!is_host}
                                className="home-button" onClick={handleStartGame}>Start Game
                            </button>}
                        <LeaveButton
                            scaleFactor={0.7}
                            handleLeave={() => handleLeave(player)}
                        />
                    </div>

                    <PopUp
                        reset={resetLastJoinLeft}
                        isVisible={PopUpIsVisible}
                        message={message}
                    />
            </GameLobbyContext.Provider>
        </div>
)
}

export default NavigateWrapper(GameLobby)
