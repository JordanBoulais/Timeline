# ==== backend_fastapi.py ====
import json
import os
import random
from pathlib import Path
from uuid import uuid4
from typing import *

import uvicorn
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from utils.Models import *
from utils.Player import Player
from utils.in_game import *
from utils.utils import *

# --- FRONTEND COMMUNICATION ---
app = FastAPI()

origins = [
    "http://localhost:5173"
]

# blocking header here
app.add_middleware(CORSMiddleware,
                   allow_origins=["*"],
                   allow_credentials=True,
                   allow_methods=["*"],
                   allow_headers=["*"])

player_db = {}
games_db = {}

# ------------------- Utils ------------------------------------

def create_game(players, host):

    game_id = str(uuid4())
    game = Game(game_id, players, host=host)

    # Adding to db
    games_db[game_id] = game

    return game

# ------------------- IN GAME -------------------

# ------------ Getting ------------


@app.get("/get_games", response_model=GamesModel)
async def get_games():
    games = [g.to_model() for g in games_db.values()]
    return GamesModel(games=games)

@app.get("/init_lobby", response_model=GameModel)
async def init_lobby(game_id: str):

    if game_id not in games_db:
        game = Game("", [])
    else:
        game = games_db[game_id]

    return game.to_model()

@app.get("/game_begin", response_model=GameModel)
async def game_begin(game_id: str):

    if game_id not in games_db:
        game = Game("", [])
    else:
        game = games_db[game_id]

    return game.to_model()

@app.get("/get_timeline", response_model=TimeLineModel)
async def get_timeline(game_id: str):

    if game_id not in games_db:
        game = Game("", [])
    else:
        game = games_db[game_id]

    return game.get_timeline().to_model()


@app.get("/get_hands", response_model=HandsModel)
async def get_hands(game_id: str):

    if game_id not in games_db:
        game = Game("", [])
    else:
        game = games_db[game_id]

    for hand in game.get_hands().values():
        hand.set_new_to_hand("")

    hands_model = HandsModel(hands = game.get_hands_model())

    return hands_model


# ------------ POSTING ------------
@app.post("/game_init", response_model=GameModel)
async def game_init(game_model: GameModel):


    player = Player(game_model.current_player.name, "")
    game = create_game([], player)

    return game.to_model()

@app.post("/game_join", response_model=GameModel)
async def game_join(game_model: GameModel):

    # Game not found
    if not game_model.id in games_db.keys():

        print("********************")

        return Game("", []).to_model()

    # Adding player to game
    game = games_db[game_model.id]

    # Max 4 players
    if len(game.get_players()) >= 4:
        return Game("FULL", []).to_model()

    return game.to_model()

@app.post("/game_start", response_model=GameModel)
async def game_start(game_start_model: GameModel):

    game = games_db[game_start_model.id]
    deck = Deck.load_deck(game_start_model.deck)
    deck.shuffle()
    starting_card = deck.top_card()

    # adding to timeline
    timeline = Timeline(starting_card)

    # Give starting hands
    hands = {}
    names = []
    players = game_start_model.players
    random.shuffle(players)
    for player_model in players:
        names.append(player_model.name)
        player = Player(player_model.name)
        hand = Hand(player)
        hand.set_cards(deck.top_n_cards(game_start_model.hand_size))
        hands[player_model.name] = hand
        hand.set_hints(game_start_model.hints)

    game.set_default()

    game.set_hints(game_start_model.hints)
    game.set_hand_size(game_start_model.hand_size)
    game.set_deck(deck)
    game.set_timeline(timeline)
    game.set_hands(hands)
    game.set_players_orders(names)

    return game.to_model()

@app.post("/select_card", response_model=CardSelectedModel)
async def select_card(card: CardSelectedModel):
    game = games_db[card.game_id]
    hand = game.get_hands()[card.player_name]

    # Cannot choose another card if in hint mode
    if hand.get_hint_mode():
        return card

    if (game.get_selected_card() and
        game.get_selected_card().get_title() == card.selected_card.title):
        hand.set_card_selected_by_title("")
        game.set_selected_card(None)
    else:
        hand.set_card_selected_by_title(card.selected_card.title)
        selected_card = Card(card.selected_card.title,
                             card.selected_card.year,
                             card.selected_card.img)
        game.set_selected_card(selected_card)

    return card

@app.post("/delete_game", response_model=GameModel)
async def delete_game(game: GameModel):

    print("ending game")
    try:
        del games_db[game.id]
    except KeyError:
        "All good baby"
    print(games_db)

    return game


async def check_game_state(game : Game) -> Dict[str, Any]:

    out_data = {"type" : "check_game_state",
                "game_is_over" : False,
            }

    if game.get_is_over():
        out_data["game_is_over"] = True

    return out_data


async def place_card(game : Game, tile_index : int) -> None:

    # If currently no card selected
    selected_card = game.get_selected_card()
    if not selected_card:
        print("No Card Selected")
        return

    # Calculate answer
    timeline = game.get_timeline()
    answer_index = timeline.calc_answer_index(selected_card)
    timeline.add_card(selected_card, answer_index)

    # Updating player hand
    hand = game.get_hands()[game.get_players_orders()[game.get_players_turn()]]
    hand.remove_card_by_title(selected_card.get_title())
    hand.set_card_selected_by_title("")
    game.get_timeline().set_hint_tiles([])
    hand.set_hint_mode(False)
    game.set_selected_card(None)

    # If good answer,
    if tile_index == answer_index:
        # If player has no more cards, game over
        if len(hand) == 0:
            game.set_is_over(True)
            game.set_winner(hand.get_player())
            return
    # add new card to player's hand
    else:
        top_card = game.get_deck().top_card()
        hand.set_new_to_hand(top_card.get_title())
        hand.add_card(top_card)

    # Turn's index
    game.set_players_turn((game.get_players_turn() + 1) % len(game.get_players()) )

async def ask_hint(game : Game, player : str):

    player_hand = game.get_hands()[player]
    selected_card = player_hand.get_selected_card()

    # Not current player or not more hints for player or no card selected
    if player_hand.get_hints() == 0\
            or not selected_card:
        return

    # Calculate answer
    timeline = game.get_timeline()
    answer_index = timeline.calc_answer_index(selected_card)

    # number of tiles in timeline
    tiles_num = len(timeline.get_cards()) + 1

    # 3 tiles always as hint
    indexes = list(range(answer_index, answer_index+3))

    if tiles_num > 3:
        # moving tile window randomly
        random_offset = random.randint(0, 2)
        indexes = list(map(lambda x: x - random_offset, indexes))
        # if greater than number of tiles
        if indexes[-1] > tiles_num-1:
            indexes = list(map(lambda x: x - (indexes[-1]-(tiles_num-1)), indexes))
        # if window goes under 0
        elif indexes[0] < 0:
            indexes = list(map(lambda x: x + abs(indexes[0]), indexes))
    else:
        indexes = indexes[0:tiles_num]

    new_hints = player_hand.get_hints() - 1
    new_hints = new_hints if new_hints > 0 else 0
    player_hand.set_hints(new_hints)
    player_hand.set_hint_mode(True)

    game.get_timeline().set_hint_tiles(indexes)



@app.websocket("/ws/game/{game_id}/{player_name}")
async def game_ws(websocket: WebSocket, game_id: str, player_name: str):
    await websocket.accept()

    game = games_db[game_id]
    player = Player(name=player_name, websocket=websocket)
    player_db[player_name] = player
    game.add_player(player)

    # Notify everyone in the lobby
    data = {}
    data["type"] = "player_joined"
    data["players"] = game.get_players()
    await broadcast_game(game, data)

    try:
        while True:
            data = await websocket.receive_json()
            await broadcast_game(game, data)
    except WebSocketDisconnect:
        game.remove_player(player)
        game.set_is_over(True)

        # Removing from player database
        del player_db[player_name]

        # If host left, setting new host
        if len(game.get_players()) > 0:
            if game.get_host() == player:
                game.set_host(game.get_players()[0])

            # broadcast to game
            data = {
                "type": "player_left",
                "player_left": player
            }
            await broadcast_game(game, data)
        else:
            print(f"Deleting game with id: {game_id}")
            del games_db[game_id]

async def broadcast_game(game: Game, data):
    players = [p.to_model().model_dump() for p in game.get_players()]

    print(players)

    comm_type = data.get("type")

    # Update game
    if comm_type == "place_card":
        await place_card(game, data.get("tile_index"))
    elif  comm_type == "ask_hint":
        await ask_hint(game, data.get("player"))
    elif comm_type == "input_updated":
        game.set_selected_deck(data.get("selected_deck"))
        game.set_password(data.get("password"))
        game.set_hand_size(data.get("hand_size"))
        game.set_hints(data.get("hints"))

    # Communicate with all players
    for player in game.get_players():
        try:
            # Lobby Actions
            if comm_type == "player_joined":
                await player.get_websocket().send_json({
                    "type": "player_joined",
                    "players": players,
                    "host": game.get_host().to_model().model_dump()
                })
            elif comm_type == "input_updated":
                await player.get_websocket().send_json({
                    "type": "input_updated",
                    "selected_deck" :  data.get("selected_deck"),
                    "hand_size" : data.get("hand_size"),
                    "hints" : data.get("hints"),
                    "password" : data.get("password"),
                })
            elif comm_type == "navigate_to_board_game":
                await player.get_websocket().send_json({
                    "type" : "navigate_to_board_game"
                })
            # In Game Actions
            elif comm_type == "place_card":
                await player.get_websocket().send_json({
                    "type" : "place_card",
                    "timeline" : game.get_timeline().to_model().model_dump(),
                    "hands" : game.get_dump_hands_model(),
                    "players_turn" : game.get_players_orders()[game.get_players_turn()],
                    "is_over" : game.get_is_over(),
                    "winner" : game.get_winner().get_name() if game.get_winner() else "",
                })
            elif comm_type == "ask_hint":
                await player.get_websocket().send_json({
                    "type": "ask_hint",
                    "hint_tiles": game.get_timeline().get_hint_tiles()
                })
            elif comm_type == "check_game_state":
                out_data = await check_game_state(game)
                await player.get_websocket().send_json(out_data)
            # In game and lobby actions
            elif comm_type == "player_left":
                await player.get_websocket().send_json({
                    "type": "player_left",
                    "player_left": data.get("player_left").to_model().model_dump(),
                    "host" : game.get_host().to_model().model_dump(),
                    "players" : players
                })
        except Exception as e:
            print(f"WebSocket send error: {e}")


if __name__ == '__main__':
    uvicorn.run(app, host="0.0.0.0", port=8000)
