import GuessCardHand from "../components/GuessCardHand.jsx";
import Hand from "../components/Hand.jsx";
import api from "../services/api.js"
import TimeLine from "../components/TimeLine.jsx";
import WinnerPopUp from "../components/WinnerPopUp.jsx";
import LeftPopUp from "../components/LeftPopUp.jsx";
import RandomLineBackground from "../components/RandomLineBackground.jsx";
import LeaveButton from "../components/LeaveButton.jsx";
import "../css/Tile.css"
import "../css/BoardGame.css"
import "../css/Utils.css"
import React, {createContext, useContext, useEffect, useState} from "react";
import {NavigateWrapper} from "./NavigateWrapper.jsx";
import { WebSocketContextObj } from './WebSocketContext.jsx'
import {DndContext} from "@dnd-kit/core";
import PlayersTurn from "../components/PlayersTurn.jsx";

export const BoardGameContext = createContext(null);

/**
 * Board game page component.
 */
function BoardGame({navigate, location}){

    const wsContext = useContext(WebSocketContextObj);
    const wsRef = React.useRef(null);

    const [gameId, setGameId] = useState("");
    const [player, setPlayer] = useState("");
    const [players, setPlayers] = useState([]);
    const [hands, setHands] = useState({})
    const [host, setHost] = useState("");
    const [playersTurn, setPlayersTurn] = useState("");
    const [timeline, setTimeline] = useState(null);
    const [rows, setRows] = useState([]);
    const [rowCount, setRowCount] = useState(1);
    const [hintTiles, setHintTiles] = useState([]);
    const [bgColor, setBgColor] = useState([Math.random()*255,
                                                    Math.random()*255,
                                                    Math.random()*255]);
    const [isOver, setIsOver] = useState(false);
    const [winners, setWinners] = useState([]);
    const [playerLeft, setPlayerLeft] = useState("");
    const [overTile, setOverTile] = useState(-9999999);
    const [maxCardsPerRow, setMaxCardPerRow] = useState(8);

    const handleLeave = () => {
        wsRef.current.close();
        navigate("/");
    }

    /**
     * Create rows based on cards input.
     */
    const cardsToRows = (cards) => {
        let cardWidth = window.innerWidth < 768 ? 65 : 155;
        let maxCards = window.innerWidth < 768 ? 4 : 8;
        let cardsPerRow = Math.floor(window.innerWidth / cardWidth)

        cardsPerRow = (cardsPerRow > maxCards) ? maxCards : cardsPerRow
        setMaxCardPerRow(maxCards);

        let rs = [];
        let row = [];
        for (let i=0; i< cards.length; i++){
            row.push(cards[i]);
            if (((i + 1) % cardsPerRow) === 0){
                rs.push(row);
                row = [];
            }
        }

        // Si des cartes restent à la fin, on les ajoute aussi
        if (row.length > 0) {
            rs.push(row);
        }
        return rs;
    };


    /**
     * Check if game has ended. Communicate with backend.
     */
    const checkGameState = async () => {
        const message = {
            type: "check_game_state",
        };

        wsRef.current.send(JSON.stringify(message))
    }

    /**
     * Update all hands. (`get` from backend)
     */
    const updateHandCards = async (currentGameId) => {
        try{
            const response = await api.get('/get_hands', {
            params: {
            game_id: currentGameId
          },
        });
            setHands(response.data.hands);
        } catch (error) {
            console.error("Could not place card");
        }
    };

    /**
     * Player ask for hint. Communicate with backend.
     */
    const askHint = async () => {
        const message = {
            type: "ask_hint",
            player: player
        };
        wsRef.current.send(JSON.stringify(message))
    }

    /**
     * Upon dragging, update game's selected card. Communicate with backend.
     */
    const handleDragStart = async (event) => {
        const { active } = event;
        const card_data = JSON.parse(active.id);

          let message = {
            type: "select_card",
            player_name : player,
            card_title: card_data.title
            };

            wsRef.current.send(JSON.stringify(message))

        await updateHandCards(gameId)
    }

    const handleDragEnd = async (event) => {
      const { active, over } = event;

      try {
        const tileData = JSON.parse(over.id);

        const message = {
          type: "place_card",
          tile_index: tileData.index
        };

        wsRef.current.send(JSON.stringify(message));
      } catch (error) {
      }

      // Send follow-up message regardless of drop
      wsRef.current.send(
        JSON.stringify({
          type: "over_tile",
          over_tile: -999999
        })
      );
    };

    const handleDragOver = async (event) => {
        const { active, over } = event;

            if (!over || !over.id) {
                return; // Nothing to do if there's no target to drag over
            }

            let tileData;
            try {
                tileData = JSON.parse(over.id);
            } catch (err) {
                console.error("Invalid JSON in over.id:", over.id);
                return;
            }

        const message = {
            type: "over_tile",
            over_tile : tileData.index
        }
        wsRef.current.send(JSON.stringify(message))
    }

    const handleTileClick = async (tileIndex) => {
        const message = {
            type: "place_card",
            tile_index: tileIndex
        };

        wsRef.current.send(JSON.stringify(message))
    };

      const handlePopState = (event) => {
    // Only intercept "back"
    window.history.pushState(null, "", window.location.href);
  };

    const getBoardGameInitValues = async (_gameId, _player) => {
        try {
            wsRef.current = wsContext.getSocket();
            if (wsRef.current === null){
                navigate("/",
                        {});
            }

            const response = await api.get('/game_begin', {
                params: {
                    game_id: _gameId,
                    current_player: _player,
                },
            });
            // Maybe handle this in backend
            let rs = cardsToRows(response.data.timeline.cards)
            setHost(response.data.host.name);
            setTimeline(response.data.timeline);
            setPlayers(response.data.players);
            setHands(response.data.hands);
            setPlayersTurn(response.data.players_turn);
            setRows(rs);
            setIsOver(false);
            setWinners([]);
            setPlayerLeft("");
            setHintTiles([]);
        } catch (error) {
            console.error('Error fetching starting hands');
        }
    }

    // Component mounted
    useEffect(() => {
        let player = location?.state?.player || localStorage.getItem("player") || "";
        let gameId = location?.state?.gameId || localStorage.getItem("gameId") || "";
        document.title = `Timeline - ${player}`
        setGameId(gameId);
        setPlayer(player);

        localStorage.setItem("player", player);
        localStorage.setItem("gameId", gameId);

        window.history.pushState(null, "", window.location.href);
        window.addEventListener("popstate", handlePopState);


        // Game init values and ws
        getBoardGameInitValues(gameId, player);

        wsRef.current = wsContext.getSocket();
        if (wsRef.current === null){
            navigate("/");
        } else {
            wsRef.current.onmessage = (event) => {
                const data = JSON.parse(event.data);
                // Place card on timeline
                if (data.type === "place_card") {
                    let rs = cardsToRows(data.timeline.cards)
                    setTimeline(data.timeline);
                    setHands(data.hands);
                    setPlayersTurn(data.players_turn);
                    setRows(rs);
                    setRowCount(rs.length);
                    setIsOver(data.is_over);
                    setWinners(data.winners);
                    setHintTiles([]);
                    checkGameState()
                }
                // Check if player has left
                else if (data.type === "player_left") {
                    setIsOver(true);
                    setPlayerLeft(data.player_left.name);
                    setHost(data.host.name);
                    checkGameState()
                }

                // Asking for hint
                else if (data.type === "ask_hint") {
                    setHintTiles(data.hint_tiles);
                    updateHandCards(gameId);
                } else if (data.type === "over_tile") {
                    setOverTile(data.over_tile);
                }
                // Check if game is over
                else if (data.type === "check_game_state") {
                    if (data.game_is_over) {
                        setTimeout(() => {
                            navigate("/game_lobby", {
                                state: {
                                    gameId: gameId,
                                    player: player,
                                }
                            });
                        }, 3000);
                    }
                }
            } // end Handlers
        }
        return () => {
            window.removeEventListener("popstate", handlePopState);
        };
    },[])

    if (gameId === ""){
            return;
        }

    if (timeline == null || hands == null){
        return;
    }

    const hand = hands[player];
    const isPlayersTurn = (player === playersTurn)

    const hasWinners = (isOver && winners.length !== 0);
    const left = (isOver && playerLeft !== "");

    // Display Hands here
    return (

        <BoardGameContext.Provider value={{player,
                                    isPlayersTurn,
                                    maxCardsPerRow,
                                    overTile,
                                    hintTiles,
                                    handleTileClick}} >
        <div className="board-game">
            <div className="bg-color"
                 style={{
                     backgroundColor: `rgb(${bgColor[0]},
                                        ${bgColor[1]},
                                         ${bgColor[2]})`
                 }}
            />

            <RandomLineBackground/>

            <div className="vertical-div"
                style={{
                    position: "absolute",
                    top: "10px",
                    userSelect: "none"
                }}>
                <div className="players-turn-container">
                    {Object.values(hands).map((hand, index) =>
                        (<PlayersTurn
                                winners={winners}
                                key={index}
                                playersTurn={playersTurn}
                                player={hand.player.name}
                                cardsNum={hand.cards.length}
                            />
                        ))}
                </div>
                <LeaveButton
                    handleLeave={handleLeave}
                  scaleFactor={0.5}
                />
            </div>

            <DndContext
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDragOver={handleDragOver}
            >

                <TimeLine cards={timeline.cards}
                          gameId={gameId}
                          rows={rows}
                          rowCount={rowCount}
                />
                <Hand gameId={gameId}
                      player_name={hand.player.name}
                      cards={hand.cards}
                      Hints={hand.hints}
                      askHint={askHint}
                      hands={hands}
                      newToHand={hand.new_to_hand}
                />
            </DndContext>
            <WinnerPopUp
                isVisible={hasWinners}
                winners={winners}
            />
            <LeftPopUp
                isVisible={left}
                player_left={playerLeft}
            />
        </div>
        </BoardGameContext.Provider>
    )
}

export default NavigateWrapper(BoardGame)
