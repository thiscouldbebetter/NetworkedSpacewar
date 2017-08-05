function ArrayExtensions()
{
	// extension class
}

{
	Array.prototype.addLookups = function(keyName)
	{
		for (var i = 0; i < this.length; i++)
		{
			var item = this[i];
			var key = item[keyName];
			this[key] = item;
		}

		return this;
	}

	Array.prototype.append = function(other)
	{
		for (var i = 0; i < other.length; i++)
		{
			this.push(other[i]);
		}

		return this;
	}

	Array.prototype.clone = function()
	{
		var returnValues = [];

		for (var i = 0; i < this.length; i++)
		{
			var item = this[i];
			var itemCloned = item.clone();
			returnValues.push(itemCloned);
		}

		return returnValues;	
	}

	Array.prototype.contains = function(itemToFind)
	{
		return (this.indexOf(itemToFind) >= 0);
	}

	Array.prototype.members = function(memberName)
	{
		var returnValues = [];

		for (var i = 0; i < this.length; i++)
		{
			var item = this[i];
			var member = item[memberName];
			returnValues.push(member);
		}

		return returnValues;
	}

	Array.prototype.removeAt = function(indexToRemoveAt)
	{
		this.splice(indexToRemoveAt, 1);
	}

	Array.prototype.remove = function(itemToRemove)
	{
		if (this.contains(itemToRemove) == true)
		{
			this.removeAt(this.indexOf(itemToRemove));
		}
	}
}
