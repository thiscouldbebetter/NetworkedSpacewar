
class Card
{
	constructor(suit, rank)
	{
		this.suit = suit;
		this.rank = rank;
	}

	name()
	{
		return this.rank.name + " of " + this.suit.name;
	}

	symbol()
	{
		return this.rank.symbol + this.suit.symbol;
	}
}
