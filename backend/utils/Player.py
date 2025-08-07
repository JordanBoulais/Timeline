from .Models import PlayerModel

class Player():

    def __init__(self, name, websocket=None , id=""):

        self.name = name
        self.websocket = websocket
        self.id = id

    def get_name(self):
        return self.name

    def get_websocket(self):
        return self.websocket

    def to_model(self):
        return PlayerModel(id=self.id, name=self.name)

    def __eq__(self, other):
        return self.name == other.get_name()