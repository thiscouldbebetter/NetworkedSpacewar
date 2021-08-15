class RandomizerSystem {
	static Instance() {
		if (RandomizerSystem._instance == null) {
			RandomizerSystem._instance = new RandomizerSystem();
		}
		return RandomizerSystem._instance;
	}
	getNextRandom() {
		return Math.random();
	}
}
