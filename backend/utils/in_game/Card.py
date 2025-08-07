
from ..Models import CardModel

class Card():

    def __init__(self, title, year, img=""):

        self.title = title
        self.year = year
        self.img = img
        self.selected = False

    def __lt__(self, other):
        if self.year < other.year:
            return True

    def __str__(self):
        return f"[{self.title} - {self.year}]"

    def set_selected(self, bool):
        self.selected = bool

    def get_title(self):
        return self.title

    def to_model(self):
        return CardModel(title=self.title,
                         year=self.year,
                         img=self.img,
                         selected=self.selected
                         )

    @classmethod
    def fromModel(cls, model):

        card = Card(model.title, model.year, model.img, model.selected)

        return card