
class CardGroup
{
	constructor(name, cards)
	{
		this.name = name;
		this.cards = cards;
	}

	static deckStandard()
	{
		var cards = [];

		var suits = CardSuit.Instances()._All;
		var ranks = CardRank.Instances()._All;

		for (var s = 0; s < suits.length; s++)
		{
			var suit = suits[s];

			for (var r = 0; r < ranks.length; r++)
			{
				var rank = ranks[r];

				var card = new Card(suit, rank);

				cards.push(card);
			}
		}

		var cardGroup = new CardGroup
		(
			"Deck",
			cards
		);

		return cardGroup;
	}
}
