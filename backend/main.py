# ==== backend_fastapi.py ====
import asyncio
import json
import os
import random
from pathlib import Path
from uuid import uuid4
from typing import *
import time

import uvicorn
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from utils.Models import *
from utils.Player import Player
from utils.in_game import *

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

    print(f"Created game with id: {game_id}")

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

    game.set_in_game(False)

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
    elif game.get_in_game():
        return Game("INGAME", []).to_model()
    elif game_model.current_player.name in [p.get_name() for p in game.get_players()]:
        return Game("PLAYERALREADYEXISTS", []).to_model()

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
    game.set_in_game(True)

    return game.to_model()

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

    # Updating player hand and timeline
    hand = game.get_hands()[game.get_players_orders()[game.get_players_turn()]]
    hand.remove_card_by_title(selected_card.get_title())
    hand.set_card_selected_by_title("")
    game.get_timeline().set_hint_tiles([])
    hand.set_hint_mode(False)
    game.set_selected_card(None)

    # Right answer
    if tile_index == answer_index:
        timeline.add_card(selected_card, answer_index)
        # If player has no more cards, game over
        if len(hand) == 0:
            game.add_winner(hand.get_player())
    # Wrong answer
    else:

        game.add_discarded_card(selected_card)

        # Deck still have cards
        if game.get_deck().get_cards():
            top_card = game.get_deck().top_card()

        # Deck have no more cards
        else:
            new_deck = Deck(game.dump_discarded_cards(), game.get_selected_deck())
            new_deck.shuffle()
            game.set_deck(new_deck)
            print(game.get_deck())
            top_card = game.get_deck().top_card()

        hand.set_new_to_hand(top_card.get_title())
        hand.add_card(top_card)


    # Check if game is over here
    print(game.get_players_turn())
    if game.get_winners() and game.get_players_turn() == (len(game.get_players()) - 1):
        game.set_is_over(True)

    # Turn's index
    game.set_players_turn((game.get_players_turn() + 1) % len(game.get_players()) )

async def ask_hint(game : Game, player : str):

    player_hand = game.get_hands()[player]
    selected_card = player_hand.get_selected_card()

    # Not current player or not more hints for player or no card selected
    # Or already in hint mode
    if player_hand.get_hints() == 0\
            or not selected_card\
            or player_hand.get_hint_mode():
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


async def select_card(game : Game,
                      player_name : str,
                      card_title : str):
    hand = game.get_hands()[player_name]

    if hand.get_hint_mode():
        return

    hand.set_card_selected_by_title(card_title)
    selected_card = hand.get_selected_card()
    game.set_selected_card(selected_card)


@app.websocket("/ws/game/{game_id}/{player_name}")
async def game_ws(websocket: WebSocket, game_id: str, player_name: str):
    await websocket.accept()

    if game_id not in games_db.keys():
        return

    game = games_db[game_id]

    # Check for refresh
    player = game.get_player_by_name(player_name)
    if player:
        player.set_websocket(websocket)
        player.set_disconnection(False)
    else:
        player = Player(name=player_name, websocket=websocket, id=str(uuid4()))
        player_db[player.get_id()] = player
        game.add_player(player)

        # Notify everyone in the lobby
        data = {}
        data["type"] = "player_joined"
        data["players"] = game.get_players()
        data["player_joined"] = player_name
        await broadcast_game(game, data)

    try:
        while True:
            data = await websocket.receive_json()
            await broadcast_game(game, data)
    except WebSocketDisconnect:

        try:
            player.set_disconnection(True)
            await asyncio.sleep(1)

            if not player.get_disconnection():
                return

            game.remove_player(player)
            game.set_is_over(True)

            # If host left, setting new host
            if len(game.get_players()) > 0:
                if game.get_host() == player:
                    game.set_host(game.get_players()[0])

                # broadcast to game
                data = {
                    "type": "player_left",
                    "player_left": player.get_name()
                }
                await broadcast_game(game, data)
            else:
                print(f"Deleting game with id: {game_id}")
                del games_db[game_id]

            # Removing from player database
            del player_db[player.get_id()]
        except Exception:
            pass

async def broadcast_game(game: Game, data):

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
    elif comm_type == "select_card":
        await select_card(game,
                          data.get("player_name"),
                          data.get("card_title"))

    # Communicate with all players
    players = [p.to_model().model_dump() for p in game.get_players()]
    for player in game.get_players():
        try:
            # Lobby Actions
            if comm_type == "player_joined":
                await player.get_websocket().send_json({
                    "type": "player_joined",
                    "players": players,
                    "host": game.get_host().to_model().model_dump(),
                    "player_joined" : data.get("player_joined")
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
                    "winners" : [w.get_name() for w in game.get_winners()],
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
                    "player_left": data.get("player_left"),
                    "host" : game.get_host().to_model().model_dump(),
                    "players" : players
                })
            elif comm_type == "over_tile":
                await player.get_websocket().send_json({
                    "type": "over_tile",
                    "over_tile" : data.get("over_tile"),
                })
        except Exception as e:
            print(f"WebSocket send error: {e}")


if __name__ == '__main__':
    uvicorn.run(app, host="0.0.0.0", port=8000)
