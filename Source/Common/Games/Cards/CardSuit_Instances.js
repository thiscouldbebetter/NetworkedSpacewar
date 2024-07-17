
class CardSuit_Instances
{
	constructor()
	{
		var cs = (n, s, c) => new CardSuit(n, s, c);

		var colorBlack = "Black";
		var colorRed = "Red";

		this.Clubs 		= cs("Clubs", "C", colorBlack);
		this.Diamonds 	= cs("Diamonds", "D", colorRed);
		this.Hearts 	= cs("Hearts", "H", colorRed);
		this.Spades 	= cs("Spades", "S", colorBlack);

		this._All =
		[
			this.Clubs,
			this.Diamonds,
			this.Hearts,
			this.Spades
		];
	}
}
