
class CardRank_Instances
{
	constructor()
	{
		var cr = (n, s, v) => new CardRank(n, s, v);

		this.Two 	= cr("Two", "2", 2);
		this.Three 	= cr("Three", "3", 3);
		this.Four 	= cr("Four", "4", 4);
		this.Five 	= cr("Five", "5", 5);
		this.Six 	= cr("Six", "6", 6);
		this.Seven 	= cr("Seven", "7", 7);
		this.Eight 	= cr("Eight", "8", 8);
		this.Nine 	= cr("Nine", "9", 9);
		this.Ten 	= cr("Ten", "10", 10);
		this.Jack 	= cr("Jack", "J", 11);
		this.Queen 	= cr("Queen", "Q", 12);
		this.King 	= cr("King", "K", 13);
		this.Ace 	= cr("Ace", "A", 14);

		this._All =
		[
			this.Two,
			this.Three,
			this.Four,
			this.Five,
			this.Six,
			this.Seven,
			this.Eight,
			this.Nine,
			this.Ten,
			this.Jack,
			this.Queen,
			this.King,
			this.Ace
		];
	}
}
