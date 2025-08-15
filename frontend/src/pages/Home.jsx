import React, {useEffect, useState} from "react";
import "../css/Home.css"
import "../css/Utils.css"
import {NavigateWrapper} from "./NavigateWrapper.jsx";
import RandomLineBackground from "../components/RandomLineBackground.jsx";
import HomePagePassword from "../components/HomePagePassword.jsx";
import api from "../services/api.js";
import GameBrowser from "../components/GameBrowser.jsx";

function Home({navigate, location}){

    const [player, setPlayer] = useState("");
    const [password, setPassword] = useState("");
    const [gamePasswordPopUp, setGamePasswordPopUp] = useState(false);
    const [gameBrowserWindow, setGameBrowserWindow] = useState(false);
    const [selectedGame, setSelectedGame] = useState({});
    const [games, setGames] = useState([]);
    const [bgColor, setBgColor] = useState([Math.random()*255, Math.random()*255, Math.random()*255])

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

    const handleJoinWithPassword = () => {

        if (password === selectedGame.password){

            handleJoin(selectedGame.id)
        } else {
            alert("Wrong Password")
        }
    }

    const handleJoin = (gameId) => {

        // Add game to server
        const _handleJoin = async () => {

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
                hint_size : 0,
                hand_size : 0
            })

            if (response.data.id === ""){
                alert("Could Not Find Game");
                return;
            }

            else if (response.data.id === "FULL"){
                alert("Game is already full (4 Players Max.)");
                return;
            } else if (response.data.id === "INGAME"){
                alert("In Game.\nWait for it to end.");
                return;
            } else if (response.data.id === "PLAYERALREADYEXISTS"){
                alert(`Player with name '${player}' already exits in this game.\nPlease change name.`);
                return;
            }

            // Navigate to game lobby
            navigate("/game_lobby",
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

    const joinGame = (player) =>{
        // Check if player entered a name
        if (player === ""){
            alert("Enter a PlayerName");
            return;
        }
            const fetch_games = async () => {
            try{
                const response = await api.get('/get_games');
                setGames(response.data.games);
                setGameBrowserWindow(true);
            } catch (error) {
                console.error("Could not place card");
            }}
        fetch_games()
    }

    const handleCloseGameBrowser = (event) =>{
        setGameBrowserWindow(false);
    }

    const handleGameCardClick = (game) =>{
        // Join game or enter password

        if (game.password === ""){
            handleJoin(game.id)
        } else{
            setGamePasswordPopUp(true);
            setSelectedGame(game);
        }
    }

    const createGame = (player) =>{

        // Check if player entered a name

        if (player === ""){
            alert("Enter a PlayerName");
            return;
        }

        // Add game to server
        const gameInit = async (player) => {
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
                hint_size : 0
            })

            // Navigate to game lobby
            navigate("/game_lobby",
                    { state: {  gameId: response.data.id,
                                host : response.data.host.name,
                                player : player,
                                players : response.data.players}});

        } catch (error){
            alert(error)
            console.error('Error Initiating game')
        }}
        gameInit(player)
    }


    useEffect(() => {
        document.title = `Timeline`
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
                handleJoin={handleJoinWithPassword}
            />

            <div className="vertical-div">
                <label className="name-input-label">
                    Enter Name
                </label>
                <input className="name-input"
                       type="text"
                       id="player-name"
                       onChange={handleInputChange}
                        maxLength="15"/>
            </div>

            <div className="home-button-div">
            <button className="home-button" onClick={() => createGame(player)}>Create Game</button>
            <button className="home-button" onClick={() => joinGame(player)}>Join Game</button>
            </div>

        </div>
    )
}

export default NavigateWrapper(Home);
