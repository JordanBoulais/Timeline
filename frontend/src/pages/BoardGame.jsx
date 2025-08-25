import Hand from "../components/Hand.jsx";
import TimeLine from "../components/TimeLine.jsx";
import WinnerPopUp from "../components/WinnerPopUp.jsx";
import LeftPopUp from "../components/LeftPopUp.jsx";
import RandomLineBackground from "../components/RandomLineBackground.jsx";
import LeaveButton from "../components/LeaveButton.jsx";
import "../css/Tile.css"
import "../css/BoardGame.css"
import "../css/Utils.css"
import React, {createContext, useContext, useEffect, useRef, useState} from "react";
import {NavigateWrapper} from "./NavigateWrapper.jsx";
import { WebSocketContextObj } from './WebSocketContext.jsx'
import {AppContext} from "../App.jsx"
import {DndContext} from "@dnd-kit/core";
import PlayersTurn from "../components/PlayersTurn.jsx";
import PopUp from "../components/PopUp.jsx";
import GuessCardTimeLineGhost from "../components/GuessCardTimeLineGhost.jsx";

export const BoardGameContext = createContext(null);

/**
 * Board game page component.
 */
function BoardGame({navigate, location}){


    const wsContext = useContext(WebSocketContextObj);
    const {onMobile} = useContext(AppContext);
    const wsRef = React.useRef(null);

    const [gameId, setGameId] = useState("");
    const [player, setPlayer] = useState("");
    const [players, setPlayers] = useState([]);
    const [hands, setHands] = useState({})
    const [host, setHost] = useState("");
    const [socketId, setSocketId] = useState("");
    const [playersTurn, setPlayersTurn] = useState("");
    const [timeline, setTimeline] = useState(null);
    const [rows, setRows] = useState([]);
    const [rowCount, setRowCount] = useState(1);
    const [hintTiles, setHintTiles] = useState([]);
    const [bgColor, setBgColor] = useState([onMobile ? Math.random()*255*0.5 : Math.random()*255,
                                                    onMobile ? Math.random()*255*0.5 : Math.random()*255,
                                                    onMobile ? Math.random()*255*0.5 : Math.random()*255]);
    const [isOver, setIsOver] = useState(false);
    const [winners, setWinners] = useState([]);
    const [playerLeft, setPlayerLeft] = useState("");
    const [overTile, setOverTile] = useState(-9999999);
    const [maxCardsPerRow, setMaxCardPerRow] = useState(8);
    const [popUpMessage, setPopUpMessage] = useState("");

    const [timelineGhosts, setTimelineGhosts] = useState({});
    const [wrongAnswer, setWrongAnswer] = useState(false);

    const handleLeave = () => {

        let message = {
            type : "player_left",
            player_left : player};

        wsRef.current.send(JSON.stringify(message));

        navigate("/");
    }

    const reset = () => {
        setPopUpMessage("");
    }


    /**
     * Create rows based on cards input.
     */
    const cardsToRows = (cards) => {
        let cardWidth = onMobile ? 65 : 155;
        let maxCards = onMobile ? 4 : 8;
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


    const resetTimelineGhosts = (key) => {

        setTimelineGhosts(prev => {
          const newPopUps = { ...prev }; // copy the object
          delete newPopUps[key];    // remove the key
          return newPopUps;              // update state
            });
    }


    /**
     * Check if game has ended. Communicate with backend.
     */
    const checkGameState = () => {
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

            let message = {
                type : "get_hands",
                game_id : currentGameId
            }

            wsRef.current.send(JSON.stringify(message))

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
            place_card : JSON.parse(active.id),
            tile_index: tileData.index,
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

  const setBoardGameInitValues = (data) => {
        let rs = cardsToRows(data.timeline.cards)
        setHost(data.host.name);
        setTimeline(data.timeline);
        setPlayers(data.players);
        setHands(data.hands);
        setPlayersTurn(data.players_turn);
        setRows(rs);
        setIsOver(false);
        setWinners([]);
        setPlayerLeft("");
        setHintTiles([]);
  }

  const getWebSocket = (socketId) => {

        wsRef.current = socketId ? wsContext.getSocket(socketId) : null;
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN){
            navigate("/");
        }
    }

    const getBoardGameInitValues = (_gameId) => {

        let message = {
            type : "game_begin",
            game_id : _gameId
        }

        wsRef.current.send(JSON.stringify(message))
    }

    // Component mounted
    useEffect(() => {
        let id = location?.state?.socketId;
        getWebSocket(id)

        let player = location?.state?.player || "";
        let gameId = location?.state?.gameId ||  "";
        document.title = `Timeline - ${player}`
        setGameId(gameId);
        setPlayer(player);
        setSocketId(id)
        localStorage.setItem("player", player);
        localStorage.setItem("gameId", gameId);

        window.history.pushState(null, "", window.location.href);
        window.addEventListener("popstate", handlePopState);

        if (wsRef.current) {
            // Game init values and ws
            getBoardGameInitValues(gameId);

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
                    setIsOver(data.isOver);
                    setWinners(data.winners);
                    setHintTiles([]);


                    // If wrong answer, displaying answer as a ghost card effect.
                    if (data.timeline.new_card !== null && !data.timeline.right_answer){
                        setWrongAnswer(true);

                        setTimeout(() => {
                                setWrongAnswer(false)
                              }, 1800);

                        const element = document.getElementById(`${data.ghostRefYear}-timeline`);
                        const rect = element.getBoundingClientRect();

                        let cardWidth = onMobile ? 65 : 155;
                        let cardXOffsetExtra = onMobile ? 10 : 8;
                        let cardXOffset = data.ghostRefPos === "Left" ? (cardWidth/2 + cardXOffsetExtra) * -1 : (cardWidth/2 + cardXOffsetExtra)
                        let dropPosition = [rect.left + cardXOffset, rect.top];

                        setTimelineGhosts(prev => ({
                          ...prev, [data.placeCard.title]: {title : data.placeCard.title,
                                                            year : data.placeCard.year,
                                                            img : data.placeCard.img,
                                                            position : dropPosition
                                                            },}));

                    }

                    checkGameState()
                }
                else if (data.type === "game_begin") {
                    setBoardGameInitValues(data);
                }
                else if (data.type === "get_hands"){
                    setHands(data.hands);
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
                                    socketId : id
                                }
                            });
                        }, 3000);
                    }
                }
            } // end Handlers
        let message = {
            type : "game_begin",
        }

        wsRef.current.send(JSON.stringify(message));
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

    const wrongAnswerPopUp = (!timeline.right_answer
                                        && timeline.new_card != null
                                        && popUpMessage !== "")

    // alert(wrongAnswerPopUp)
    // Display Hands here
    return (
        <BoardGameContext.Provider value={{player,
                                    isPlayersTurn,
                                    playersTurn,
                                    maxCardsPerRow,
                                    overTile,
                                    hintTiles,
                                    timeline,
                                    handleTileClick,
                                    wrongAnswer
                                    }} >
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


                {Object.entries(timelineGhosts).map(([key, card]) => (
                  <GuessCardTimeLineGhost
                    key={key}        // use the object key
                    title={key}
                    year={card.year}
                    img={card.img}
                    position={card.position} // the value
                    reset={resetTimelineGhosts}
                  />
                ))}

                <PopUp
                    isVisible={wrongAnswerPopUp}
                    message={popUpMessage}
                    reset={reset}
                />

                <DndContext
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    onDragOver={handleDragOver}
                >
                    <TimeLine gameId={gameId}
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
