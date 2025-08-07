import GuessCardHand from "../components/GuessCardHand.jsx";
import Hand from "../components/Hand.jsx";
import api from "../services/api.js"
import TimeLine from "../components/TimeLine.jsx";
import WinnerPopUp from "../components/WinnerPopUp.jsx";
import LeftPopUp from "../components/LeftPopUp.jsx";
import imageMap from "../components/ImageMap.jsx";
import HintButton from "../components/HintButton.jsx";
import RandomLineBackground from "../components/RandomLineBackground.jsx";
import "../css/Tile.css"
import "../css/BoardGame.css"
import "../css/Utils.css"
import React from "react";
import {NavigateWrapper} from "./NavigateWrapper.jsx";
import { WebSocketContextObj } from './WebSocketContext.jsx'

class BoardGame extends React.Component{
    static contextType = WebSocketContextObj;

    constructor(props){
        super(props);
        this.state = {
            host : "",
            player : "",
            gameId: "",
            playersTurn : "",
            timeline : null,
            rows : [],
            rowCount : 1,
            hint_tiles : [],
            hands : null,
            players : [],
            bg_color : [Math.random()*255, Math.random()*255, Math.random()*255],
            isOver : false,
            winner : "",
            player_left: "",
            new_to_hand : ""
        }
        this.ws = null;
    }

    cardsToRows(cards) {
        let rows = [];
        let row = [];
        for (let i=0; i< cards.length; i++){
            row.push(cards[i]);
            if (((i + 1) % 8) === 0){
                rows.push(row);
                row = [];
            }
        }
        // Si des cartes restent à la fin, on les ajoute aussi
        if (row.length > 0) {
            rows.push(row);
        }
        return rows;
    };

    componentDidMount() {
      const { state } = this.props.location || {};
      const gameId = state?.gameId || null;
      const player = state?.player || null;

    // Preventing from changing page
    window.history.pushState(null, null, window.location.href);
    this.handlePopState = () => {
      window.history.pushState(null, null, window.location.href);
    };
    window.addEventListener('popstate', this.handlePopState);

      this.setState(
        {
          gameId: gameId,
          player: player,
            }
      );

        const gameBegin = async (gameId, player) => {
          try {
            const response = await api.get('/game_begin', {
              params: {
                    game_id: gameId,
                    current_player: player,
              },
            });

            // Maybe handle this in backend
            let rows = this.cardsToRows(response.data.timeline.cards)

            this.setState({
                host: response.data.host.name,
                timeline: response.data.timeline,
                players: response.data.players,
                hands: response.data.hands,
                playersTurn : response.data.players_turn,
                rows : rows,
                isOver : false,
                winner : "",
                player_left: "",
                new_to_hand : "",
                hint_tiles : []
            });
          } catch (error) {
            alert(error);
            console.error('Error fetching starting hands');
          }
        }

        gameBegin(gameId, player);

        // Init websocket
      this.ws = this.context.getSocket();

      if (!this.ws || this.ws.readyState === WebSocket.CLOSED) {
        this.ws = this.context.connect(`ws://localhost:8000/ws/game/${gameId}/${player}`);
        console.log("WebSocket reconnected from BoardGame");
      } else {
        console.log("Reusing existing WebSocket");
      }
        // Websocket Handlers
        this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            // Place card on timeline
            if (data.type === "place_card") {
                let rows = this.cardsToRows(data.timeline.cards)
                this.setState(
                    {
                        timeline : data.timeline,
                        hands : data.hands,
                        playersTurn : data.players_turn,
                        hint_tiles : [],
                        rowCount : rows.length,
                        rows : rows,
                        isOver : data.is_over,
                        winner : data.winner
                    })

                this.checkGameState()
            }
            // Check if player has left
            else if (data.type === "player_left") {

                this.setState(
                    {
                        isOver : true,
                        player_left : data.player_left.name,
                        host : data.host.name
                    })

                this.checkGameState()
      }
            // Asking for hint
            else if (data.type === "ask_hint") {
                this.setState(
                    {
                    hint_tiles : data.hint_tiles
                    }
                )}
            // Check if game is over
            else if (data.type === "check_game_state") {
                if (data.game_is_over){
                    setTimeout(() => {
                        this.props.navigate("/game_lobby", {
                            state: {
                                gameId: this.state.gameId,
                                host: this.state.host,
                                player: this.state.player,
                                players: []
                            }
                        });
                    }, 3000);
                }}
      } // end Handlers
            };

      componentWillUnmount() {
    window.removeEventListener('popstate', this.handlePopState);
  }

    handleTileClick = async (tileIndex) => {
        const message = {
            type: "place_card",
            tile_index: tileIndex
        };

        this.ws.send(JSON.stringify(message))
    };

    checkGameState = async () => {

        const message = {
            type: "check_game_state",
        };

        this.ws.send(JSON.stringify(message))
    }


    updateHandCards = async () => {
        try{
            const response = await api.get('/get_hands', {
          params: {
            game_id: this.state.gameId
          },
        });
            this.setState({
          hands: response.data.hands
        });
        } catch (error) {
            console.error("Could not place card");
        }
    };

    setHintTiles = async () => {

    const message = {
        type: "ask_hint",
        player: this.state.player
    };

    this.ws.send(JSON.stringify(message))

    }

    render() {

        const {gameId, timeline, hands, player, playersTurn, rows, rowCount} = this.state;

        if (gameId === ""){
            return;
        }

        if (timeline == null || hands == null){
            return;
        }

        const hand = this.state.hands[player];
        const isPlayersTurn = (player === playersTurn)

        const winner = (this.state.isOver && this.state.winner !== "");
        const left = (this.state.isOver && this.state.player_left !== "");

        // Display Hands here
        return (

            <div className="board-game">

                <div className="bg-color"
                     style={{
                         backgroundColor : `rgb(${this.state.bg_color[0]},
                                            ${this.state.bg_color[1]},
                                             ${this.state.bg_color[2]})`
                     }}
                />

                <RandomLineBackground/>

                    {/*<TimeLine cards={[{title : "sasa", year : 1995}]}/>*/}
                    <TimeLine   cards={timeline.cards} gameId={gameId}
                                hintTiles={this.state.hint_tiles}
                                isPlayersTurn={isPlayersTurn}
                                handleTileClick={this.handleTileClick}
                                rows={rows}
                                rowCount={rowCount}
                    />
                    <Hand   gameId={gameId}
                            player_name={hand.player.name}
                            cards={hand.cards}
                            updateHandCards={this.updateHandCards}
                            Hints={hand.hints}
                            setHintTiles={this.setHintTiles}
                            isPlayersTurn={isPlayersTurn}
                            hands={this.state.hands}
                            playersTurn={this.state.playersTurn}
                            new_to_hand={hand.new_to_hand}
                    />
                <WinnerPopUp
                    isVisible={winner}
                    winner={this.state.winner}
                />
                <LeftPopUp
                    isVisible={left}
                    player_left={this.state.player_left}
                />
                </div>
                )}}

export default NavigateWrapper(BoardGame)
