class Polar {
	constructor(azimuthInTurns, radius, elevationInTurns) {
		this.azimuthInTurns = azimuthInTurns;
		this.radius = radius;
		this.elevationInTurns = (elevationInTurns == null ? 0 : elevationInTurns);
	}
	static create() {
		return new Polar(0, 0, 0);
	}
	static default() {
		return new Polar(0, 1, 0);
	}
	// instance methods
	addToAzimuthInTurns(turnsToAdd) {
		this.azimuthInTurns += turnsToAdd;
		return this;
	}
	fromCoords(coordsToConvert) {
		this.azimuthInTurns =
			Math.atan2(coordsToConvert.y, coordsToConvert.x)
				/ Polar.RadiansPerTurn;
		if (this.azimuthInTurns < 0) {
			this.azimuthInTurns += 1;
		}
		this.radius = coordsToConvert.magnitude();
		this.elevationInTurns =
			Math.asin(coordsToConvert.z / this.radius)
				/ Polar.RadiansPerTurn;
		return this;
	}
	overwriteWith(other) {
		this.azimuthInTurns = other.azimuthInTurns;
		this.radius = other.radius;
		this.elevationInTurns = other.elevationInTurns;
		return this;
	}
	overwriteWithAzimuthRadiusElevation(azimuthInTurns, radius, elevationInTurns) {
		this.azimuthInTurns = azimuthInTurns;
		this.radius = radius;
		if (elevationInTurns != null) {
			this.elevationInTurns = elevationInTurns;
		}
		return this;
	}
	random(randomizer) {
		if (randomizer == null) {
			randomizer = new RandomizerSystem();
		}
		this.azimuthInTurns = randomizer.getNextRandom();
		this.elevationInTurns = randomizer.getNextRandom();
		return this;
	}
	toCoords(coords) {
		var azimuthInRadians = this.azimuthInTurns * Polar.RadiansPerTurn;
		var elevationInRadians = this.elevationInTurns * Polar.RadiansPerTurn;
		var cosineOfElevation = Math.cos(elevationInRadians);
		coords.overwriteWithDimensions
		(
			Math.cos(azimuthInRadians) * cosineOfElevation,
			Math.sin(azimuthInRadians) * cosineOfElevation,
			Math.sin(elevationInRadians)
		).multiplyScalar
		(
			this.radius
		);
		return coords;
	}

	toString()
	{
		return "(" + this.azimuthInTurns + ", " + this.radius + ")";
	}

	wrap() {
		while (this.azimuthInTurns < 0) {
			this.azimuthInTurns++;
		}
		while (this.azimuthInTurns >= 1) {
			this.azimuthInTurns--;
		}
		return this;
	}
	// Clonable.
	clone() {
		return new Polar(this.azimuthInTurns, this.radius, this.elevationInTurns);
	}

	static RadiansPerTurn = 2 * Math.PI;
}
