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
import {DndContext} from "@dnd-kit/core";
import PlayersTurn from "../components/PlayersTurn.jsx";

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
            winners : [],
            player_left: "",
            overTile : -9999999
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
    const gameId = state?.gameId || localStorage.getItem("gameID") || "";
    const player = state?.player || localStorage.getItem("player") || "";

    // Preventing from changing page
    localStorage.setItem("gameID", "");
    localStorage.setItem("player", "");
    window.history.pushState(null, null, window.location.href);
    window.addEventListener("popstate", this.handleBackButton);
    window.addEventListener("beforeunload", this.handlePageReload);

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
                winners : [],
                player_left: "",
                hint_tiles : [],
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
                        winners: data.winners
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
                )
                this.updateHandCards();
            }
            else if (data.type === "over_tile"){
                this.setState({
                    overTile : data.over_tile
                })
            }
            // Check if game is over
            else if (data.type === "check_game_state") {
                if (data.game_is_over){
                    setTimeout(() => {
                        this.props.navigate("/game_lobby", {
                            state: {
                                gameId: this.state.gameId,
                                player: this.state.player,
                            }
                        });
                    }, 3000);
                }}
      } // end Handlers
            };

      componentWillUnmount() {
        window.removeEventListener("popstate", this.handleLeave);
        window.removeEventListener("beforeunload", this.handlePageReload);
  }

    handleBackButton = (event) => {
    window.history.pushState(null, null, window.location.href);
  };

    handlePageReload = (event) => {
        localStorage.setItem("gameID", this.state.gameId);
        localStorage.setItem("player", this.state.player);
        const message = {
          type: "someone_page_refresh",
        };

        this.ws.send(JSON.stringify(message));
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

  handleDragStart = async (event) => {
    const { active } = event;
    const card_data = JSON.parse(active.id);

    // Need to fix ask hint

      let message = {
        type: "select_card",
        player_name : this.state.player,
        card_title: card_data.title
    };

    this.ws.send(JSON.stringify(message))

    await this.updateHandCards()
  }

handleDragEnd = async (event) => {
  const { active, over } = event;

  try {
    const tileData = JSON.parse(over.id);

    const message = {
      type: "place_card",
      tile_index: tileData.index
    };

    this.ws.send(JSON.stringify(message));
  } catch (error) {
  }

  // Send follow-up message regardless of drop
  this.ws.send(
    JSON.stringify({
      type: "over_tile",
      over_tile: -999999
    })
  );
};

  handleDragOver = async (event) => {
    const { active, over } = event;

    let tileData = JSON.parse(over.id);

    const message = {
    type: "over_tile",
    over_tile : tileData.index
    }

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

        const winners = (this.state.isOver && this.state.winners.length !== 0);
        const left = (this.state.isOver && this.state.player_left !== "");

        // Display Hands here
        return (

            <div className="board-game">

                <div className="bg-color"
                     style={{
                         backgroundColor: `rgb(${this.state.bg_color[0]},
                                            ${this.state.bg_color[1]},
                                             ${this.state.bg_color[2]})`
                     }}
                />

                <RandomLineBackground/>

                <div className="horizontal-div"
                     style={{
                         position: "absolute",
                         top: "10px",
                         userSelect: false
                     }}
                >
                    {Object.values(hands).map((hand, index) =>
                        (<PlayersTurn
                                winners={this.state.winners}
                                key={index}
                                playersTurn={playersTurn}
                                player={hand.player.name}
                                cardsNum={hand.cards.length}
                            />
                        ))}
                </div>


                <DndContext
                    onDragStart={this.handleDragStart}
                    onDragEnd={this.handleDragEnd}
                    onDragOver={this.handleDragOver}
                >

                    <TimeLine cards={timeline.cards} gameId={gameId}
                              hintTiles={this.state.hint_tiles}
                              isPlayersTurn={isPlayersTurn}
                              handleTileClick={this.handleTileClick}
                              rows={rows}
                              rowCount={rowCount}
                              overTile={this.state.overTile}
                    />
                    <Hand gameId={gameId}
                          player_name={hand.player.name}
                          cards={hand.cards}
                          Hints={hand.hints}
                          setHintTiles={this.setHintTiles}
                          isPlayersTurn={isPlayersTurn}
                          hands={this.state.hands}
                          playersTurn={this.state.playersTurn}
                          new_to_hand={hand.new_to_hand}
                    />
                </DndContext>
                <WinnerPopUp
                    isVisible={winners}
                    winners={this.state.winners}
                />
                <LeftPopUp
                    isVisible={left}
                    player_left={this.state.player_left}
                />
            </div>
        )
    }
}

export default NavigateWrapper(BoardGame)
