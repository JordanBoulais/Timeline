from .Models import HandModel, PlayerModel
from .Player import Player

class Hand():

    def __init__(self, player):

        if isinstance(player, str):
            player = Player(player)

        self.player = player
        self.cards = []
        self.hints = 1
        self.selected_card = None
        self.hint_mode = False
        self.new_to_hand = ""

    def __len__(self):
        return len(self.cards)

    def add_card(self, card):
        self.cards.append(card)

    def set_cards(self, cards):
        self.cards = cards

    def get_card(self, card):
        for c in self.cards:
            if c.title == card.title:
                return c

    def get_card_by_title(self, title):
        for c in self.cards:
            if c.title == title:
                return c

    def set_card_selected_by_title(self, title):
        for c in self.cards:
            if c.title == title:
                c.set_selected(True)
                self.selected_card = c
            else:
                c.set_selected(False)

        if not title:
            self.selected_card = None

    def get_selected_card(self):
        return self.selected_card

    def remove_card_by_title(self, card_title):
        for card in self.cards:
            if card.title == card_title:
                self.cards.remove(card)

    def get_player(self):
        return self.player

    def get_hints(self):
        return self.hints

    def set_hints(self, hints):
        self.hints = hints

    def set_hint_mode(self, hint_mode):
        self.hint_mode = hint_mode

    def set_new_to_hand(self, new_to_hand):
        self.new_to_hand = new_to_hand

    def get_new_to_hand(self):
        return self.new_to_hand

    def get_hint_mode(self):
        return self.hint_mode

    def to_model(self):

        playerModel = PlayerModel(id=self.player.id, name= self.player.name)


        return HandModel(player=playerModel,
                         cards=[card.to_model() for card in self.cards],
                         hints=self.hints,
                         new_to_hand=self.new_to_hand)
