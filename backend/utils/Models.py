from pydantic import BaseModel
from typing import List, Dict

class CardModel(BaseModel):
    title : str
    year : int
    img : str
    selected : bool

class CardSelectedModel(BaseModel):
    player_name : str
    game_id : str
    selected_card : CardModel

class PlayerModel(BaseModel):
    id : str
    name : str

class HandModel(BaseModel):
    player : PlayerModel
    cards : List[CardModel]
    hints : int
    new_to_hand : str

class HandsModel(BaseModel):
    hands : Dict[str, HandModel]

class TimeLineModel(BaseModel):
    cards : List[CardModel]

class GameModel(BaseModel):
    id : str
    timeline : TimeLineModel | None
    current_player: PlayerModel | None
    players : List[PlayerModel]
    hands : Dict[str, HandModel]
    hand_size : int
    players_turn : str
    host : PlayerModel | None
    password: str
    deck : str
    decks: List[str]
    hints : int
    hint_size : int

class GamesModel(BaseModel):
    games : List[GameModel]

class PlaceCardModel(BaseModel):
    game_id : str
    index : int

class HintModel(BaseModel):
    indexes : List[int]

class HintRequest(BaseModel):
    player_name: str
    game_id: str