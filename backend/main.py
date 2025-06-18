# ==== backend_fastapi.py ====
import json

import uvicorn
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles

from Models import *

# --- FRONTEND COMMUNICATION ---
app = FastAPI()

origins = [
    "http://localhost:5173"
]

# blocking header here
app.add_middleware(CORSMiddleware,
                   allow_origins=origins,
                   allow_credentials=True,
                   allow_methods=["*"],
                   allow_headers=["*"])

memory_db = {"Deck" : [],
             "TimeLine" : [],
             "SelectedCard" : None,
             "Answer_Index" : 0,
             "Players" : []}

# ------------------- Utils ------------------------------------
def load_deck(deck_name):

    with open( f"/decks/{deck_name}.json", "r") as file:
        data = json.load(file)
        file.close()

    cards = []
    for card in data:
        cards.append(Card(title=card["title"], year=card["year"], image=""))

    return cards

def calc_answer_index(card):

    index = 0
    for c in memory_db["Deck"]:
        if c.year < card.year:
            index += 1
        else:
            break

    return index


# ------------------- Getting ------------------------------------

@app.get("/starting_hands", response_model=Card)
async def starting_hands():



    return Card(title="birth", year=1997, image="")

@app.get("/draw_card", response_model=Card)
async def get_card_from_deck():
    return Card(title="birth", year=1997, image="")

@app.get("/get_answer_index", response_model=int)
async def get_answer_index():
    return 5

# ------------------- POSTING ------------------------------------

@app.post("/play_card", response_model=Card)
async def play_card(card: Card):
    pass

@app.post("/select_card", response_model=Card)
async def select_card(card: Card):

    memory_db["SelectedCard"] = card

    # Update answer index here
    index = calc_answer_index(card)
    memory_db["Answer_Index"] = index

    return None



if __name__ == '__main__':
    uvicorn.run(app, host="0.0.0.0", port=8000)
