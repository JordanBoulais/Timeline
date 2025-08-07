from pathlib import Path
import os

def list_decks():
    current_path = Path(__file__).resolve().parent
    decks = os.listdir(os.path.join(current_path, "../decks"))
    decks = [deck.split(".")[0] for deck in decks]
    return decks