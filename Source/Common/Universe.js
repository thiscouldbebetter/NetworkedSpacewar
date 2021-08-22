class Universe
{
	constructor(world)
	{
		this.world = world;
	}

	initialize()
	{
		this.display = new Display("divDisplay", this.world.size);
		this.display.initialize(document);

		this.inputHelper = new InputHelper();
		this.inputHelper.initialize(document, this.display);

		return this;
	}
}
