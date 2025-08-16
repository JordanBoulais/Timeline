import os
import json
from random import shuffle

from .Card import Card

class Deck():

    def __init__(self, cards : list[Card], name):
        self.cards = cards
        self.name = name

    def get_name(self):
        return self.name

    def top_card(self):
        return self.cards.pop()

    def top_n_cards(self, n):

        cards = []
        for i in range(n):
            cards.append(self.top_card())

        return cards

    def shuffle(self):
        shuffle(self.cards)

    def get_cards(self):
        return self.cards

    def __str__(self):

        out_str = "{"

        for card in self.cards:
            out_str += str(card)
        out_str += "}"

        return out_str


    @classmethod
    def load_deck(cls, deck_name):
        script_dir = os.path.dirname(os.path.abspath(__file__))
        file_path = os.path.join(script_dir, "../../", "decks", f"{deck_name}.json")

        # script_dir = os.path.dirname(os.path.abspath(__file__))
        # file_path = os.path.join(script_dir, "decks", f"{deck_name}.json")

        with open(file_path, "r") as file:
            data = json.load(file)
            file.close()

        deck = Deck([], deck_name)

        for card in data:
            deck.cards.append(Card(card["title"],
                                   card["year"],
                                   card["img"]))

        return deck