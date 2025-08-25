from ..Models import TimeLineModel

class Timeline():

    def __init__(self, starting_card):
        self.cards = [starting_card]
        self.hint_tiles = []
        self.new_card = None
        self.right_answer = False
        self.ghost_ref = None
        self.ghost_ref_pos = "Left"

    def calc_answer_index(self, card):

        index = 0
        for c in self.cards:
            if c < card:
                index += 1
            else:
                break
        return index

    def set_ghost_ref_pos(self, pos):
        self.ghost_ref_pos = pos

    def set_right_answer(self, right_answer):
        self.right_answer = right_answer

    def set_new_card(self, new_card):
        self.new_card = new_card

    def set_ghost_ref(self, ghost_ref):
        self.ghost_ref = ghost_ref

    def set_hint_tiles(self, hint_tiles):
        self.hint_tiles = hint_tiles

    def get_ghost_ref_pos(self):
        return self.ghost_ref_pos

    def get_right_answer(self):
        return self.right_answer

    def get_ghost_ref(self):
        return self.ghost_ref

    def get_hint_tiles(self):
        return self.hint_tiles

    def add_card(self, card, index):
        self.cards.insert(index, card)

    def get_cards(self):
        return self.cards

    def get_new_card(self):
        return self.new_card

    def to_model(self):

        return TimeLineModel(cards=[card.to_model() for card in self.cards],
                             new_card=None if not self.new_card else self.new_card.to_model(),
                             right_answer=self.right_answer)