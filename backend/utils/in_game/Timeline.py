from ..Models import TimeLineModel

class Timeline():

    def __init__(self, starting_card):
        self.cards = [starting_card]
        self.hint_tiles = []

    def calc_answer_index(self, card):

        index = 0
        for c in self.cards:
            if c < card:
                index += 1
            else:
                break
        return index

    def set_hint_tiles(self, hint_tiles):
        self.hint_tiles = hint_tiles

    def get_hint_tiles(self):
        return self.hint_tiles

    def add_card(self, card, index):
        self.cards.insert(index, card)

    def get_cards(self):
        return self.cards

    def to_model(self):

        return TimeLineModel(cards=[card.to_model() for card in self.cards])