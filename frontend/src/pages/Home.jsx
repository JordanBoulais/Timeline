import React, {useContext, useEffect, useState, useRef} from "react";
import "../css/Home.css"
import "../css/Utils.css"
import {NavigateWrapper} from "./NavigateWrapper.jsx";
import RandomLineBackground from "../components/RandomLineBackground.jsx";
import HomePagePassword from "../components/HomePagePassword.jsx";
import GameBrowser from "../components/GameBrowser.jsx";
import AttemptingConnexion from "../components/AttemptingConnexion.jsx";
import {API_BASE_URL} from "../util.js"
import {WebSocketContextObj} from "./WebSocketContext.jsx";
import {AppContext} from "../App.jsx";

function Home({navigate, location}){

    const wsContext = useContext(WebSocketContextObj);
    const onMobile = useContext(AppContext);
    const wsRef = React.useRef(null);

    const [player, setPlayer] = useState("");
    const playerRef = React.useRef(player);

    const [socketId, setSocketId] = useState("");
    const socketIdRef = useRef("");

    const [password, setPassword] = useState("");
    const [gamePasswordPopUp, setGamePasswordPopUp] = useState(false);
    const [gameBrowserWindow, setGameBrowserWindow] = useState(false);
    const [attemptingConnexion, setAttemptingConnexion] = useState(true);
    const attemptingConnexionRef = React.useRef(attemptingConnexion);

    const [selectedGame, setSelectedGame] = useState({});
    const [games, setGames] = useState([]);
    const [bgColor, setBgColor] = useState([Math.random()*255,
                                                        Math.random()*255,
                                                        Math.random()*255])
    const handleInputChange = (event) => {
        setPlayer(event.target.value);
    };

    const handleGamePasswordChanged = (event) => {
        setPassword(event.target.value);
    };

    const handlePasswordPopUpClose = (event) => {
        setGamePasswordPopUp(true);
        setPassword("");
    };

    const clickJoinWithPassword = () => {

        if (password === selectedGame.password){
            let message =
                { type : "game_join",
                    game_id : selectedGame.id,
                    player_name : player
                };
                wsRef.current.send(JSON.stringify(message));
        } else {
            alert("Wrong Password")
        }
    }

    const joinGame = (data) => {

        if (data.id === ""){
                alert("Could Not Find Game");
                return;
            }
            else if (data.id === "FULL"){
                alert("Game is already full (4 Players Max.)");
                return;
            } else if (data.id === "INGAME"){
                alert("In Game.\nWait for it to end.");
                return;
            } else if (data.id === "PLAYERALREADYEXISTS"){
                alert(`Player with name '${playerRef.current}' already exits in this game.\nPlease change name.`);
                return;
            }

            // Navigate to game lobby
            navigate("/game_lobby",
                    { state: { gameId: data.id,
                                host : data.host.name,
                                player : playerRef.current,
                                players : data.players,
                                socketId : socketIdRef.current
                    }});
    }

    const handleCloseGameBrowser = (event) =>{
        setGameBrowserWindow(false);
    }

    const handleGameCardClick = (game) =>{
        // Join game or enter password

        if (game.password === ""){
            let message =
                { type : "game_join",
                    game_id : game.id,
                    player_name : playerRef.current
                };
                wsRef.current.send(JSON.stringify(message));
        } else{
            setGamePasswordPopUp(true);
            setSelectedGame(game);
        }
    }

    const createGame = (player) =>{

        // Check if player entered a game

        if (player === ""){
            alert("Enter a PlayerName");
            return;
        }

        let message = {
            type : "game_init",
            player_name : player
        }

        wsRef.current.send(JSON.stringify(message))
    }

    const clickJoinGame = (player) =>{
        // Check if player entered a name
        if (player === ""){
            alert("Enter a PlayerName");
            return;
        }

        let message = {
            type : "fetch_games"
        };

        wsRef.current.send(JSON.stringify(message));
    }

    const fetchGames = (data) => {
        setGameBrowserWindow(true);
        setGames(data.games);
    }


        useEffect(() => {
          playerRef.current = player;
    }, [player]);

        useEffect(() => {
          attemptingConnexionRef.current = attemptingConnexion;
    }, [attemptingConnexion]);

    useEffect(() => {

        // Establishing connexion with backend
        let id = crypto.randomUUID();
        const tryConnect = () => {
            const socket = wsContext.getSocket(id);

            if (!socket || (socket.readyState !== WebSocket.OPEN && socket.readyState !== WebSocket.CONNECTING)) {
                //`wss://${API_BASE_URL}/ws/timeline/${id}`, id`
                // `ws://localhost:8080/ws/timeline/${id}`
                wsContext.connect(`ws://localhost:8080/ws/timeline/${id}`, id);
                console.log("Attempting connexion");
            }

            if (socket && socket.readyState === WebSocket.OPEN) {
                console.log("Socket is OPEN");
                socketIdRef.current = id;
                setSocketId(id);
                setAttemptingConnexion(false);
                wsRef.current = wsContext.getSocket(id)

                // Websocket communications
                wsRef.current.onmessage = (event) => {
                    const data = JSON.parse(event.data);
                    if (data.type === "game_join") {
                        joinGame(data)
                    }
                    else if (data.type === "fetch_games"){
                        fetchGames(data)
                    }
                    else if (data.type === "game_init"){
                        // Navigate to game lobby
                        navigate("/game_lobby",
                                { state: {  gameId: data.id,
                                            host : data.host.name,
                                            player : playerRef.current,
                                            players : data.players,
                                            socketId : id
                                }});
                    }
                }
            } else {
                setTimeout(tryConnect, 50);
            }
        };

        tryConnect();

        document.title = "Timeline"

        return () => {
        }
    }, []);

    return (
        <div className="home">

            <div className="bg-color"
                 style={{
                     backgroundColor: `rgb(${bgColor[0]},
                                        ${bgColor[1]},
                                         ${bgColor[2]})`
                 }}
            />

            <RandomLineBackground/>

            <GameBrowser
                isVisible={gameBrowserWindow}
                games={games}
                handleCloseGameBrowser={handleCloseGameBrowser}
                handleGameCardClick={handleGameCardClick}
            />

            <HomePagePassword
                isVisible={gamePasswordPopUp}
                handleGamePasswordChanged={handleGamePasswordChanged}
                handlePasswordPopUpClose={handlePasswordPopUpClose}
                handleJoin={clickJoinWithPassword}
            />

            <AttemptingConnexion
                isVisible={attemptingConnexion}
            />

            <div className="vertical-div">
                <label className="name-input-label">
                    Enter Name
                </label>
                <input className="name-input"
                       type="text"
                       id="player-name"
                       onChange={handleInputChange}
                        maxLength="15"
                        disabled={attemptingConnexion}
                />

            </div>

            <div className="home-button-div">
            <button className="home-button"
                    onClick={() => createGame(player)}
                    disabled={attemptingConnexion}
            >Create Game</button>
            <button className="home-button"
                    onClick={() => clickJoinGame(player)}
                    disabled={attemptingConnexion}
            >Join Game</button>
            </div>

        </div>
    )
}

export default NavigateWrapper(Home);
