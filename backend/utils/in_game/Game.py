import copy

from . import Timeline, Card
from ..Models import GameModel

from ..utils import list_decks

class Game():

    def __init__(self, id, players, host=None):
        self.id = id
        if isinstance(players, list):
            self.players = players
        else:
            self.players = [players]

        # In Game Lobby
        self.host = host
        self.password = ""
        self.selected_deck = ""
        self.deck = None
        self.decks = list_decks()
        self.players_orders = []
        self.hand_size = 5
        self.hints = 0
        self.discarded_cards = []

        # In Game
        self.hands = {}
        self.timeline = Timeline(Card("", 99999999))
        self.players_turn = 0
        self.selected_card = None
        self.someone_page_refresh = False

        self.in_game = False
        self.is_over = False
        self.winners = []
        self.left = None

    def set_default(self):
        self.hands = {}
        self.selected_deck = ""
        self.deck = None
        self.timeline = Timeline(Card("", 99999999))
        self.players_turn = 0
        self.players_orders = []
        self.selected_card = None
        self.is_over = False
        self.winners = []
        self.left = None
        self.hand_size = 5
        self.hints = 0
        self.someone_page_refresh = False

    def get_player_by_name(self, name):
        for player in self.players:
            if player.name == name:
                return player

    def set_hand_size(self, size):
        self.hand_size = size

    def set_someone_page_refresh(self, value):
        self.someone_page_refresh = value

    def set_hints(self, hints):
        self.hints = hints

    def set_password(self, password):
        self.password = password

    def set_selected_card(self, card):
        self.selected_card = card

    def set_hands(self, hands):
        self.hands = hands

    def set_deck(self, deck):
        self.deck = deck
        self.selected_deck = deck.get_name()

    def set_selected_deck(self, selected_deck):
        self.selected_deck = selected_deck

    def set_timeline(self, timeline):
        self.timeline = timeline

    def set_players_orders(self, players_orders):
        self.players_orders = players_orders

    def set_players_turn(self, player):
        self.players_turn = player

    def set_is_over(self, over):
        self.is_over = over

    def add_winner(self, winner):
        self.winners.append(winner)

    def add_player(self, player):
        self.players.append(player)

    def remove_player(self, player):
        self.players.remove(player)

    def get_hand_size(self):
        return self.hand_size

    def get_hints(self):
        return self.hints

    def get_password(self):
        return self.password

    def get_id(self):
        return self.id

    def get_players(self):
        return self.players

    def set_players(self, players):
        self.players = players

    def get_players_orders(self):
        return self.players_orders

    def get_timeline(self):
        return self.timeline

    def get_players_turn(self):
        return self.players_turn

    def get_selected_card(self):
        return self.selected_card

    def get_hands(self):
        return self.hands

    def get_someone_page_refresh(self):
        return self.someone_page_refresh

    def get_hands_model(self):

        hands_model = {}

        for key, val in self.hands.items():
            hands_model[key] = val.to_model()

        return hands_model

    def get_dump_hands_model(self):

        hands_model = {}

        for key, val in self.hands.items():
            hands_model[key] = val.to_model().model_dump()

        return hands_model

    def get_left(self):
        return self.left

    def set_left(self, left):
        self.left = left

    def get_in_game(self):
        return self.in_game

    def set_in_game(self, in_game):
        self.in_game = in_game

    def get_deck(self):
        return self.deck

    def get_host(self):
        return self.host

    def get_is_over(self):
        return self.is_over

    def get_winners(self):
        return self.winners

    def get_winners_str(self):

        if len(self.winners) == 1:
            return f"{self.winners[0].get_name()} Has won!!!"
        if len(self.winners) > 1:
            return ", ".join([w.get_name() for w in self.winners]) + " Have won!!!"

        return ""

    def add_discarded_card(self, card):
        self.discarded_cards.append(card)

    def get_discarded_cards(self):
        return self.discarded_cards

    def get_selected_deck(self):
        return self.selected_deck

    def dump_discarded_cards(self):
        discarded_cards = copy.deepcopy(self.discarded_cards)
        self.discarded_cards = []
        return discarded_cards

    def set_host(self, host):
        self.host = host

    def to_model(self):

        return GameModel(id=self.id,
                         players=[player.to_model() for player in self.players],
                         hands=self.get_hands_model(),
                         hand_size=self.hand_size,
                         timeline=self.timeline.to_model(),
                         players_turn = self.players_orders[self.players_turn] if self.players_orders else "",
                         host=self.host.to_model() if self.host else None,
                         password=self.password,
                         current_player=self.get_players()[self.get_players_turn()].to_model() if self.get_players() else None,
                         deck=self.selected_deck,
                         decks=self.decks,
                         hints=self.hints
                        )