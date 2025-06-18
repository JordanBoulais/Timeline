from pydantic import BaseModel
from typing import List

class Card(BaseModel):
    title : str
    year : int
    image : str

class Player(BaseModel):
    id : str
    name : str
    hand : List[Card]

class TimeLine(BaseModel):
    cards : List[Card]

class Deck(BaseModel):
    cards: List[Card]

class Game(object):
    id : str
    players : List[Player]
    deck : Deck
    timeline : TimeLine
    score : List[int]
