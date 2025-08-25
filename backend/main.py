# ==== backend_fastapi.py ====
import asyncio
import json
import os
import random
from uuid import uuid4
from typing import *

import uvicorn
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from utils.Models import *
from utils.Player import Player
from utils.in_game import *

# --- FRONTEND COMMUNICATION ---
app = FastAPI()

# blocking header here
app.add_middleware(CORSMiddleware,
                   allow_origins=["*"],
                   allow_credentials=True,
                   allow_methods=["*"],
                   allow_headers=["*"])

player_db = {}
games_db = {}
COMM_SOLO_TYPES = ["fetch_games", "init_lobby", "game_init",
                   "game_join", "game_start", "game_begin",
                   "get_hands"]

games_lock = asyncio.Lock()

async def create_game(host : Player) -> Game:
    """
    Create a new game and add it to database.
    """

    game_id = str(uuid4())
    game = Game(game_id, [], host=host)

    # Adding to db
    games_db[game_id] = game

    print(f"Created game with id: {game_id}")

    return game

async def fetch_games():
    """
    Return all games from database.
    """

    print("fetch_games")
    async with games_lock:
        try:
            to_be_removed = [
                game_id
                for game_id, game in games_db.items()
                if len(game.get_players()) == 0
            ]
            for game_id in to_be_removed:
                games_db.pop(game_id, None)
        except Exception as e:
            print(e)

    print(games_db.values())
    games = [g.to_model() for g in games_db.values()]

    return GamesModel(games=games)

async def init_lobby(game_id: str):
    """
    Get game data for initializing lobby.
    """

    if game_id not in games_db:
        return

    game = games_db[game_id]
    game.set_in_game(False)

async def get_timeline(game_id: str):
    """
    Get timeline from game.
    """

    if game_id not in games_db:
        game = Game("", [])
    else:
        game = games_db[game_id]

    return game.get_timeline().to_model()

async def get_hands(game_id: str):
    """
    Get hands from game.
    """

    if game_id not in games_db:
        game = Game("", [])
    else:
        game = games_db[game_id]

    for hand in game.get_hands().values():
        hand.set_new_to_hand("")

    hands_model = HandsModel(hands = game.get_hands_model())

    return hands_model

async def game_join(game_id: str, player : Player):
    """
    Join game as current player.
    """

    # Game not found
    if not game_id in games_db.keys():
        return Game("NOTFOUND", [])

    game = games_db[game_id]

    # Max 4 players, game already started, player already exists in game
    if len(game.get_players()) >= 4:
        return Game("FULL", [])
    elif game.get_in_game():
        return Game("INGAME", [])
    elif player.get_name() in [p.get_name() for p in game.get_players()]:
        return Game("PLAYERALREADYEXISTS", [])

    return game

async def game_start(data):
    """
    Handle game start.
    Fetch deck cards, shuffle deck, assign hands, etc.
    """

    game = games_db[data.get("id")]
    deck = Deck.load_deck(data.get("deck"))

    deck.shuffle()
    starting_card = deck.top_card()
    # adding to timeline
    timeline = Timeline(starting_card)


    # Give starting hands
    hands = {}
    names = []
    players = game.get_players()
    random.shuffle(players)
    for player in players:
        names.append(player.get_name())
        hand = Hand(player)
        hand.set_cards(deck.top_n_cards(int(data.get("hand_size"))))
        hands[player.get_name()] = hand
        hand.set_hints(int(data.get("hints")))

    game.set_default()

    game.set_hints(int(data.get("hints")))
    game.set_hint_size(int(data.get("hint_size")))
    game.set_hand_size(int(data.get("hand_size")))
    game.set_deck(deck)
    game.set_timeline(timeline)
    game.set_hands(hands)
    game.set_players_orders(names)
    game.set_in_game(True)



async def check_game_state(game : Game) -> Dict[str, Any]:
    """
    Check if game has ended
    """
    out_data = {"type" : "check_game_state",
                "game_is_over" : False,
            }

    if game.get_is_over():
        out_data["game_is_over"] = True

    return out_data

async def place_card(game : Game, tile_index : int) -> None:
    """
    Place a card on the timeline.
    Calculate if answer is good or not.
    Add new card to Player's hand if answer is wrong.
    Determined if this is game's last turn. (If player placed all it's cards)
    """
    # If currently no card selected
    selected_card = game.get_selected_card()
    if not selected_card:
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

    timeline.set_new_card(selected_card)

    try:
        print(answer_index)
        for card in timeline.get_cards():
            print(card)
        if answer_index > len(timeline.get_cards())-1:
            timeline.set_ghost_ref(timeline.get_cards()[-1])
            timeline.set_ghost_ref_pos("Right")
        else:
            timeline.set_ghost_ref(timeline.get_cards()[answer_index])
            timeline.set_ghost_ref_pos("Left")
    except Exception as e:
        print(e)

    # Right answer
    if tile_index == answer_index:
        timeline.add_card(selected_card, answer_index)
        timeline.set_right_answer(True)
        # If player has no more cards, game over
        if len(hand) == 0:
            game.add_winner(hand.get_player())
    # Wrong answer
    else:
        game.add_discarded_card(selected_card)
        timeline.set_right_answer(False)
        # Deck still have cards
        if game.get_deck().get_cards():
            top_card = game.get_deck().top_card()

        # Deck have no more cards
        else:
            new_deck = Deck(game.dump_discarded_cards(), game.get_selected_deck())
            new_deck.shuffle()
            game.set_deck(new_deck)
            top_card = game.get_deck().top_card()

        hand.set_new_to_hand(top_card.get_title())
        hand.add_card(top_card)

    # Check if game is over here
    if game.get_winners() and game.get_players_turn() == (len(game.get_players()) - 1):
        game.set_is_over(True)

    # Turn's index
    game.set_players_turn((game.get_players_turn() + 1) % len(game.get_players()) )

async def ask_hint(game : Game, player : str):
    """
    Ask hint for player.
    Based on answer, will calculate 3 tiles (including answer) to be
    consider as hint.
    """
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

    hint_size = game.get_hint_size()

    indexes = list(range(answer_index, answer_index+hint_size))

    if tiles_num > hint_size:
        # moving tile window randomly
        random_offset = random.randint(0, hint_size-1)
        indexes = list(map(lambda x: x - random_offset, indexes))
        # if greater than number of tiles
        if indexes[-1] > tiles_num-1:
            indexes = list(map(lambda x: x - (indexes[-1]-(tiles_num-1)), indexes))
        # if window goes under 0
        elif indexes[0] < 0:
            indexes = list(map(lambda x: x + abs(indexes[0]), indexes))
    else:
        indexes =  list(range(0, tiles_num+1))

    new_hints = player_hand.get_hints() - 1
    new_hints = new_hints if new_hints > 0 else 0
    player_hand.set_hints(new_hints)
    player_hand.set_hint_mode(True)

    game.get_timeline().set_hint_tiles(indexes)


async def select_card(game : Game,
                      player_name : str,
                      card_title : str):
    """
    Selecting a card from player's hand.
    Will update game and hand.
    """
    hand = game.get_hands()[player_name]

    if hand.get_hint_mode():
        return

    hand.set_card_selected_by_title(card_title)
    selected_card = hand.get_selected_card()
    game.set_selected_card(selected_card)

@app.websocket("/ws/timeline/{player_id}")
async def game_ws(websocket: WebSocket, player_id: str):
    """
    Handle websocket handshake when a player enters a game.
    Handle when a player leaves a game. (WebSocketDisconnect)
    """
    await websocket.accept()

    player = Player(name="", websocket=websocket, id=player_id)
    game = None
    player_db[player_id] = player

    try:
        while True:
            data = await websocket.receive_json()
            game = await handle_comm(data, player, game)
    except WebSocketDisconnect:
        if isinstance(game, Game):
            # broadcast to game
            print(f"{player.get_name()} has left")
            data = {
                "type": "player_left",
                "player_left": player.get_name()
            }
            await handle_comm(data, player, game)

        # Removing from player database
        del player_db[player.get_id()]

    except Exception:
        pass


async def handle_comm(data, player, game):
    """
    Determine if communication has to be dispatched to
    every player of the game or current player only.
    """

    if data.get("type") in COMM_SOLO_TYPES:
       game = await handle_solo_comm(data, player, game)
    else:
        game = await broadcast_game(data, game)

    return game

async def handle_solo_comm(data, player, game):
    """
    Handle solo communication.
    """
    comm_type = data.get("type")

    if comm_type == "fetch_games":
        games_model = await fetch_games()
        message = games_model.model_dump()
        message["type"] = "fetch_games"
        await player.get_websocket().send_json(
            message
        )
    elif comm_type == "game_init":
        player.set_name(data.get("player_name"))
        game = await create_game(player)
        game.add_player(player)
        message = game.to_model().model_dump()
        message["type"] = "game_init"
        await player.get_websocket().send_json(
            message
        )
    elif comm_type == "game_join":
        player.set_name(data.get("player_name"))
        game = await game_join(data.get("game_id"), player)
        game.add_player(player)
        message = game.to_model().model_dump()
        message["type"] = "game_join"
        await player.get_websocket().send_json(message)
    elif comm_type == "game_start":
        await game_start(data)
        message = {"type": "game_start"}
        await player.get_websocket().send_json(message)
    elif comm_type == "init_lobby":
        await init_lobby(data.get("game_id"))
        message = game.to_model().model_dump()
        message["type"] = "init_lobby"
        await player.get_websocket().send_json(
            message
        )
    elif comm_type == "game_begin":
        message = game.to_model().model_dump()
        message["type"] = "game_begin"
        await player.get_websocket().send_json(
            message
        )
    elif comm_type == "get_hands":
        hands_model = await get_hands(data.get("game_id"))
        message = dict(hands_model.model_dump())
        message["type"] = "get_hands"
        await player.get_websocket().send_json(message)

    return game

async def broadcast_game(data, game: Game):
    """
    Notify all players in game when someone does an action (play cards, ask hint, etc.)
    """
    comm_type = data.get("type")

    # Update game
    if comm_type == "place_card":
        await place_card(game, data.get("tile_index"))
    elif  comm_type == "ask_hint":
        await ask_hint(game, data.get("player"))
    elif comm_type == "input_updated":
        game.set_selected_deck(str(data.get("selected_deck")))
        game.set_password(data.get("password"))
        game.set_hand_size(data.get("hand_size"))
        game.set_hints(data.get("hints"))
        game.set_hint_size(data.get("hint_size"))
    elif comm_type == "select_card":
        await select_card(game,
                          data.get("player_name"),
                          data.get("card_title"))
    elif comm_type == "player_left":
        host_name = game.get_host().get_name()
        game.remove_player_by_name(data.get("player_left"))
        # if now empty, deleting game
        if len(game.get_players()) == 0:
            del games_db[game.get_id()]
            return Game("", [])
        # Setting new host if host has left
        else:
            if host_name == data.get("player_left"):
                game.set_host(game.get_players()[0])

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
                    "hint_size" : data.get("hint_size"),
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
                    "placeCard" : data.get("place_card"),
                    "ghostRefYear" : game.get_timeline().get_ghost_ref().get_year(),
                    "ghostRefPos" : game.get_timeline().get_ghost_ref_pos(),
                    "timeline" : game.get_timeline().to_model().model_dump(),
                    "hands" : game.get_dump_hands_model(),
                    "players_turn" : game.get_players_orders()[game.get_players_turn()],
                    "isOver" : game.get_is_over(),
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
            elif comm_type == "kick_player":
                await player.get_websocket().send_json({
                    "type": "kick_player",
                    "kick_player": data.get("kick_player"),
                })

        except Exception as e:
            print(f"WebSocket send error: {e}")

    return game if comm_type != "player_left" else Game("", [])


if __name__ == '__main__':
    port = int(os.environ.get("PORT", 8080))
    uvicorn.run(app, host="0.0.0.0", port=port)
